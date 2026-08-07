package com.quizgame.repository;

import com.quizgame.model.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, String> {
    Optional<Answer> findByPlayerIdAndQuestionId(String playerId, String questionId);
    List<Answer> findByQuestionId(String questionId);
    boolean existsByPlayerIdAndQuestionId(String playerId, String questionId);
}
