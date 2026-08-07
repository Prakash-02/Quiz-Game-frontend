package com.quizgame.service;

import com.quizgame.model.*;
import com.quizgame.repository.AnswerRepository;
import com.quizgame.repository.PlayerRepository;
import com.quizgame.repository.TeamRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Transactional
public class ScoringService {

    private final AnswerRepository answerRepository;
    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;

    @Value("${app.scoring.base-points:1000}")
    private int basePoints;

    @Value("${app.scoring.speed-multiplier:0.5}")
    private double speedMultiplier;

    public Answer recordAnswer(Player player, Question question, QuestionOption selectedOption, long timeTakenMs) {
        if (answerRepository.existsByPlayerIdAndQuestionId(player.getId(), question.getId())) {
            throw new IllegalStateException("Player already answered this question");
        }

        boolean correct = selectedOption != null && selectedOption.isCorrect();
        int points = 0;

        if (correct) {
            double timeFraction = (double) timeTakenMs / (question.getTimeLimitSeconds() * 1000L);
            timeFraction = Math.min(1.0, Math.max(0.0, timeFraction));
            points = (int) (basePoints * (1.0 - timeFraction * speedMultiplier));
            points = Math.max(100, points);
        }

        Answer answer = Answer.builder()
                .player(player)
                .question(question)
                .selectedOption(selectedOption)
                .answeredAt(Instant.now())
                .timeTakenMs(timeTakenMs)
                .correct(correct)
                .pointsAwarded(points)
                .build();

        answerRepository.save(answer);

        player.setScore(player.getScore() + points);
        playerRepository.save(player);

        if (player.getTeam() != null) {
            Team team = player.getTeam();
            team.setTotalScore(team.getTotalScore() + points);
            teamRepository.save(team);
        }

        return answer;
    }

    @Transactional(readOnly = true)
    public boolean allPlayersAnswered(GameRoom room, Question question) {
        long activePlayers = room.getPlayers().stream()
                .filter(p -> !p.getSessionId().equals(room.getHostSessionId()))
                .filter(Player::isConnected)
                .count();
        long answeredCount = answerRepository.findByQuestionId(question.getId()).size();
        return answeredCount >= activePlayers;
    }
}
