package com.quizgame.websocket;

import com.quizgame.dto.SubmitAnswerRequest;
import com.quizgame.service.GameRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class GameWebSocketController {

    private final GameRoomService roomService;

    @MessageMapping("/room/{code}/submit-answer")
    public void submitAnswer(@DestinationVariable String code,
                             @Payload SubmitAnswerRequest req) {
        roomService.submitAnswer(code.toUpperCase(), req);
    }
}
