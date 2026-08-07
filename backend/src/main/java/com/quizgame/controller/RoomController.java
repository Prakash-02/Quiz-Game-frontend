package com.quizgame.controller;

import com.quizgame.dto.*;
import com.quizgame.model.GameRoom;
import com.quizgame.model.Player;
import com.quizgame.service.GameRoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final GameRoomService roomService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createRoom(@RequestBody Map<String, String> body) {
        String quizId = body.get("quizId");
        String hostSessionId = body.getOrDefault("hostSessionId", UUID.randomUUID().toString());
        GameRoom room = roomService.createRoom(quizId, hostSessionId);
        return ResponseEntity.ok(Map.of(
                "roomCode", room.getRoomCode(),
                "roomId", room.getId(),
                "hostSessionId", hostSessionId
        ));
    }

    @PostMapping("/{code}/join")
    public ResponseEntity<Map<String, Object>> joinRoom(
            @PathVariable String code,
            @Valid @RequestBody JoinRoomRequest req) {
        String sessionId = UUID.randomUUID().toString();
        Player player = roomService.joinRoom(code.toUpperCase(), req.getNickname(), sessionId);
        return ResponseEntity.ok(Map.of(
                "playerId", player.getId(),
                "sessionId", sessionId,
                "nickname", player.getNickname()
        ));
    }

    @PostMapping("/{code}/mode")
    public ResponseEntity<Void> setMode(
            @PathVariable String code,
            @Valid @RequestBody SetModeRequest req) {
        roomService.setMode(code.toUpperCase(), req.getMode(), req.getTeamCount());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{code}/shuffle-teams")
    public ResponseEntity<Void> shuffleTeams(@PathVariable String code) {
        roomService.shuffleTeams(code.toUpperCase());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{code}/start")
    public ResponseEntity<Void> startGame(@PathVariable String code) {
        roomService.startGame(code.toUpperCase());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{code}/next-question")
    public ResponseEntity<Void> nextQuestion(@PathVariable String code) {
        roomService.nextQuestion(code.toUpperCase());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{code}/show-results")
    public ResponseEntity<Void> showResults(@PathVariable String code) {
        roomService.showResults(code.toUpperCase());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{code}/results")
    public ResponseEntity<List<LeaderboardEntry>> getFinalResults(@PathVariable String code) {
        return ResponseEntity.ok(roomService.getFinalResults(code.toUpperCase()));
    }

    @PostMapping("/{code}/answer")
    public ResponseEntity<Map<String, Object>> submitAnswer(
            @PathVariable String code,
            @Valid @RequestBody SubmitAnswerRequest req) {
        return ResponseEntity.ok(roomService.submitAnswer(code.toUpperCase(), req));
    }
}
