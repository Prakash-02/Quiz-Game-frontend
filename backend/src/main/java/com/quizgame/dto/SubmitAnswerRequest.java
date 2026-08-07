package com.quizgame.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubmitAnswerRequest {
    @NotBlank
    private String sessionId;
    @NotBlank
    private String optionId;
    private long timeTakenMs;
}
