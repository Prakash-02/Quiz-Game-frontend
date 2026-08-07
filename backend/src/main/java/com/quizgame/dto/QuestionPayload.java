package com.quizgame.dto;

import com.quizgame.model.Question.QuestionType;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class QuestionPayload {
    private String questionId;
    private int questionNumber;
    private int totalQuestions;
    private QuestionType type;
    private String prompt;
    private String mediaUrl;
    private int timeLimitSeconds;
    private List<OptionPayload> options;

    @Data
    @Builder
    public static class OptionPayload {
        private String id;
        private String text;
        private String mediaUrl;
        private int orderIndex;
    }
}
