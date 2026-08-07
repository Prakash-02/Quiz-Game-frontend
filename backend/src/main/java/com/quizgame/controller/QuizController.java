package com.quizgame.controller;

import com.quizgame.dto.QuestionDto;
import com.quizgame.dto.QuizDto;
import com.quizgame.model.Question;
import com.quizgame.model.Quiz;
import com.quizgame.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @PostMapping
    public ResponseEntity<Quiz> createQuiz(@Valid @RequestBody QuizDto dto) {
        return ResponseEntity.ok(quizService.createQuiz(dto));
    }

    @GetMapping
    public ResponseEntity<List<Quiz>> listQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    @GetMapping("/{quizId}")
    public ResponseEntity<Quiz> getQuiz(@PathVariable String quizId) {
        return ResponseEntity.ok(quizService.getQuiz(quizId));
    }

    @PostMapping("/{quizId}/questions")
    public ResponseEntity<Question> addQuestion(
            @PathVariable String quizId,
            @RequestPart("question") @Valid QuestionDto dto,
            @RequestPart(value = "media", required = false) MultipartFile mediaFile) throws IOException {
        return ResponseEntity.ok(quizService.addQuestion(quizId, dto, mediaFile));
    }
}
