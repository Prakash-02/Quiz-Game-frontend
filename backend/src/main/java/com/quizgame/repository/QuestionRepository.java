package com.quizgame.repository;

import com.quizgame.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, String> {
    List<Question> findByQuizIdOrderByOrderIndexAsc(String quizId);
    int countByQuizId(String quizId);
}
