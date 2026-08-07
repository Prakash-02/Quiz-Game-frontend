package com.quizgame.repository;

import com.quizgame.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team, String> {
    List<Team> findByRoomIdOrderByTotalScoreDesc(String roomId);
    void deleteByRoomId(String roomId);
}
