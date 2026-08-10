package com.quizgame.service;

import com.quizgame.dto.*;
import com.quizgame.model.*;
import com.quizgame.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class GameRoomService {

    private final GameRoomRepository roomRepository;
    private final QuizRepository quizRepository;
    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ScoringService scoringService;

    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private static final List<String[]> TEAM_PRESETS = List.of(
            new String[]{"Team Red", "#EF4444"},
            new String[]{"Team Blue", "#3B82F6"},
            new String[]{"Team Green", "#22C55E"},
            new String[]{"Team Yellow", "#EAB308"}
    );

    public GameRoom createRoom(String quizId, String hostSessionId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new EntityNotFoundException("Quiz not found"));
        String code = generateUniqueCode();
        GameRoom room = GameRoom.builder()
                .roomCode(code)
                .quiz(quiz)
                .hostSessionId(hostSessionId)
                .build();
        return roomRepository.save(room);
    }

    public Player joinRoom(String roomCode, String nickname, String sessionId) {
        GameRoom room = getRoom(roomCode);
        if (room.getStatus() != GameRoom.GameStatus.LOBBY) {
            throw new IllegalStateException("Game already started");
        }
        if (playerRepository.existsByRoomIdAndNickname(room.getId(), nickname)) {
            throw new IllegalArgumentException("Nickname already taken");
        }
        Player player = Player.builder()
                .room(room)
                .nickname(nickname)
                .sessionId(sessionId)
                .build();
        player = playerRepository.save(player);
        broadcastLobby(room.getRoomCode());
        return player;
    }

    public GameRoom setMode(String roomCode, GameRoom.GameMode mode, int teamCount) {
        GameRoom room = getRoom(roomCode);
        room.setMode(mode);
        room.setTeamCount(teamCount);
        room = roomRepository.save(room);
        if (mode == GameRoom.GameMode.TEAM) {
            assignTeams(room);
        }
        broadcastLobby(room.getRoomCode());
        return room;
    }

    public void shuffleTeams(String roomCode) {
        GameRoom room = getRoom(roomCode);
        assignTeams(room);
        broadcastLobby(room.getRoomCode());
    }

    private void assignTeams(GameRoom room) {
        teamRepository.deleteByRoomId(room.getId());
        teamRepository.flush();

        List<Player> players = playerRepository.findByRoomIdOrderByScoreDesc(room.getId())
                .stream()
                .filter(p -> !p.getSessionId().equals(room.getHostSessionId()))
                .collect(Collectors.toList());

        Collections.shuffle(players, RANDOM);

        List<Team> teams = new ArrayList<>();
        for (int i = 0; i < room.getTeamCount(); i++) {
            String[] preset = TEAM_PRESETS.get(i);
            Team team = Team.builder()
                    .room(room)
                    .name(preset[0])
                    .color(preset[1])
                    .totalScore(0)
                    .build();
            teams.add(teamRepository.save(team));
        }

        for (int i = 0; i < players.size(); i++) {
            Player p = players.get(i);
            p.setTeam(teams.get(i % room.getTeamCount()));
            playerRepository.save(p);
        }
    }

    public void startGame(String roomCode) {
        GameRoom room = getRoom(roomCode);
        if (room.getStatus() != GameRoom.GameStatus.LOBBY) {
            throw new IllegalStateException("Game already started");
        }
        room.setStatus(GameRoom.GameStatus.IN_PROGRESS);
        room.setCurrentQuestionIndex(-1);
        roomRepository.save(room);
        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/lobby",
                Map.of("event", "GAME_STARTING"));
    }

    public void nextQuestion(String roomCode) {
        GameRoom room = getRoom(roomCode);
        List<Question> questions = questionRepository.findByQuizIdOrderByOrderIndexAsc(room.getQuiz().getId());
        int nextIdx = room.getCurrentQuestionIndex() + 1;
        if (nextIdx >= questions.size()) {
            finishGame(room);
            return;
        }
        room.setCurrentQuestionIndex(nextIdx);
        roomRepository.save(room);
        Question q = questions.get(nextIdx);
        QuestionPayload payload = buildQuestionPayload(q, nextIdx + 1, questions.size());
        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/question", payload);
    }

    public Map<String, Object> submitAnswer(String roomCode, SubmitAnswerRequest req) {
        GameRoom room = getRoom(roomCode);
        Player player = playerRepository.findBySessionId(req.getSessionId())
                .orElseThrow(() -> new EntityNotFoundException("Player not found"));
        List<Question> questions = questionRepository.findByQuizIdOrderByOrderIndexAsc(room.getQuiz().getId());
        Question currentQuestion = questions.get(room.getCurrentQuestionIndex());

        QuestionOption chosen = currentQuestion.getOptions().stream()
                .filter(o -> o.getId().equals(req.getOptionId()))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Option not found"));

        Answer answer = scoringService.recordAnswer(player, currentQuestion, chosen, req.getTimeTakenMs());

        Map<String, Object> result = new HashMap<>();
        result.put("correct", answer.isCorrect());
        result.put("pointsAwarded", answer.getPointsAwarded());
        result.put("playerScore", player.getScore());
        result.put("correctOptionId", currentQuestion.getOptions().stream()
                .filter(QuestionOption::isCorrect).map(QuestionOption::getId).findFirst().orElse(null));

        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/answer-result",
                Map.of("playerId", player.getId(), "correct", answer.isCorrect(),
                        "points", answer.getPointsAwarded(), "playerScore", player.getScore()));

        if (scoringService.allPlayersAnswered(room, currentQuestion)) {
            broadcastLeaderboard(roomCode, room, false);
        }

        return result;
    }

    public void showResults(String roomCode) {
        GameRoom room = getRoom(roomCode);
        List<Question> questions = questionRepository.findByQuizIdOrderByOrderIndexAsc(room.getQuiz().getId());
        Question current = questions.get(room.getCurrentQuestionIndex());
        String correctOptionId = current.getOptions().stream()
                .filter(QuestionOption::isCorrect).map(QuestionOption::getId).findFirst().orElse(null);
        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/show-results",
                Map.of("correctOptionId", correctOptionId != null ? correctOptionId : ""));
        broadcastLeaderboard(roomCode, room, false);
    }

    private void finishGame(GameRoom room) {
        room.setStatus(GameRoom.GameStatus.FINISHED);
        roomRepository.save(room);
        broadcastLeaderboard(room.getRoomCode(), room, true);
    }

    public List<LeaderboardEntry> getFinalResults(String roomCode) {
        GameRoom room = getRoom(roomCode);
        return buildLeaderboard(room);
    }

    public void broadcastWheelResult(String roomCode, String winner) {
        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/wheel-result",
                Map.of("winner", winner));
    }

    private void broadcastLeaderboard(String roomCode, GameRoom room, boolean isFinal) {
        List<LeaderboardEntry> entries = buildLeaderboard(room);
        String topic = isFinal ? "/topic/room/" + roomCode + "/final-results"
                                : "/topic/room/" + roomCode + "/leaderboard";
        messagingTemplate.convertAndSend(topic, Map.of("entries", entries, "final", isFinal));
    }

    private List<LeaderboardEntry> buildLeaderboard(GameRoom room) {
        if (room.getMode() == GameRoom.GameMode.TEAM) {
            List<Team> teams = teamRepository.findByRoomIdOrderByTotalScoreDesc(room.getId());
            List<LeaderboardEntry> entries = new ArrayList<>();
            for (int i = 0; i < teams.size(); i++) {
                Team t = teams.get(i);
                entries.add(new LeaderboardEntry(i + 1, t.getId(), t.getName(), t.getTotalScore(), t.getColor(), true));
            }
            return entries;
        } else {
            List<Player> players = playerRepository.findByRoomIdOrderByScoreDesc(room.getId())
                    .stream().filter(p -> !p.getSessionId().equals(room.getHostSessionId())).toList();
            List<LeaderboardEntry> entries = new ArrayList<>();
            for (int i = 0; i < players.size(); i++) {
                Player p = players.get(i);
                entries.add(new LeaderboardEntry(i + 1, p.getId(), p.getNickname(), p.getScore(), null, false));
            }
            return entries;
        }
    }

    private void broadcastLobby(String roomCode) {
        GameRoom room = getRoom(roomCode);
        List<Player> players = playerRepository.findByRoomIdOrderByScoreDesc(room.getId());
        List<Team> teams = room.getMode() == GameRoom.GameMode.TEAM
                ? teamRepository.findByRoomIdOrderByTotalScoreDesc(room.getId())
                : List.of();

        List<LobbyState.PlayerInfo> playerInfos = players.stream().map(p ->
                LobbyState.PlayerInfo.builder()
                        .id(p.getId())
                        .nickname(p.getNickname())
                        .teamId(p.getTeam() != null ? p.getTeam().getId() : null)
                        .teamName(p.getTeam() != null ? p.getTeam().getName() : null)
                        .teamColor(p.getTeam() != null ? p.getTeam().getColor() : null)
                        .connected(p.isConnected())
                        .build()
        ).toList();

        List<LobbyState.TeamInfo> teamInfos = teams.stream().map(t ->
                LobbyState.TeamInfo.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .color(t.getColor())
                        .memberNicknames(t.getMembers().stream().map(Player::getNickname).toList())
                        .build()
        ).toList();

        LobbyState state = LobbyState.builder()
                .roomCode(roomCode)
                .mode(room.getMode())
                .teamCount(room.getTeamCount())
                .players(playerInfos)
                .teams(teamInfos)
                .build();

        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/lobby", state);
    }

    private QuestionPayload buildQuestionPayload(Question q, int number, int total) {
        List<QuestionPayload.OptionPayload> opts = q.getOptions().stream()
                .map(o -> QuestionPayload.OptionPayload.builder()
                        .id(o.getId()).text(o.getText()).mediaUrl(o.getMediaUrl()).orderIndex(o.getOrderIndex())
                        .build())
                .toList();
        return QuestionPayload.builder()
                .questionId(q.getId())
                .questionNumber(number)
                .totalQuestions(total)
                .type(q.getType())
                .prompt(q.getPrompt())
                .mediaUrl(q.getMediaUrl())
                .timeLimitSeconds(q.getTimeLimitSeconds())
                .options(opts)
                .build();
    }

    public GameRoom getRoom(String roomCode) {
        return roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new EntityNotFoundException("Room not found: " + roomCode));
    }

    private String generateUniqueCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) sb.append(CHARS.charAt(RANDOM.nextInt(CHARS.length())));
            code = sb.toString();
        } while (roomRepository.existsByRoomCode(code));
        return code;
    }
}