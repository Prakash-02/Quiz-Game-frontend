package com.quizgame.service;

import com.quizgame.dto.QuestionDto;
import com.quizgame.dto.QuizDto;
import com.quizgame.model.Question;
import com.quizgame.model.QuestionOption;
import com.quizgame.model.Quiz;
import com.quizgame.repository.QuestionRepository;
import com.quizgame.repository.QuizRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final MediaService mediaService;

    public Quiz createQuiz(QuizDto dto) {
        Quiz quiz = Quiz.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .hostId(dto.getHostId())
                .build();
        return quizRepository.save(quiz);
    }

    public Question addQuestion(String quizId, QuestionDto dto, MultipartFile mediaFile) throws IOException {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new EntityNotFoundException("Quiz not found: " + quizId));

        int orderIndex = questionRepository.countByQuizId(quizId);

        String mediaUrl = null;
        if (mediaFile != null && !mediaFile.isEmpty()) {
            mediaUrl = mediaService.upload(mediaFile, "questions");
        }

        Question question = Question.builder()
                .quiz(quiz)
                .type(dto.getType())
                .prompt(dto.getPrompt())
                .mediaUrl(mediaUrl)
                .timeLimitSeconds(dto.getTimeLimitSeconds())
                .orderIndex(orderIndex)
                .options(new ArrayList<>())
                .build();

        if (dto.getOptions() != null) {
            for (int i = 0; i < dto.getOptions().size(); i++) {
                QuestionDto.OptionDto optDto = dto.getOptions().get(i);
                QuestionOption opt = QuestionOption.builder()
                        .question(question)
                        .text(optDto.getText())
                        .correct(optDto.isCorrect())
                        .orderIndex(i)
                        .build();
                question.getOptions().add(opt);
            }
        }

        return questionRepository.save(question);
    }

    @Transactional(readOnly = true)
    public Quiz getQuiz(String quizId) {
        return quizRepository.findById(quizId)
                .orElseThrow(() -> new EntityNotFoundException("Quiz not found: " + quizId));
    }

    @Transactional(readOnly = true)
    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }
}
