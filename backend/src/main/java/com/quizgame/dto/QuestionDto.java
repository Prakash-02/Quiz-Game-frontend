package com.quizgame.dto;

import com.quizgame.model.Question.QuestionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class QuestionDto {
    @NotNull
    private QuestionType type;

    @NotBlank
    private String prompt;

    @Min(5)
    private int timeLimitSeconds = 30;

    private List<OptionDto> options;

    @Data
    public static class OptionDto {
        @NotBlank
        private String text;
        private boolean correct;
        private int orderIndex;
    }
}
