package com.quizgame.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class QuizDto {
    @NotBlank
    private String title;
    private String description;
    private String hostId;
}
