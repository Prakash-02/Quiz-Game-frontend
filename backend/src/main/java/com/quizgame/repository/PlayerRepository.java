package com.quizgame.repository;

import com.quizgame.model.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerRepository extends JpaRepository<Player, String> {
    List<Player> findByRoomIdOrderByScoreDesc(String roomId);
    Optional<Player> findBySessionId(String sessionId);
    Optional<Player> findByRoomIdAndNickname(String roomId, String nickname);
    boolean existsByRoomIdAndNickname(String roomId, String nickname);
}
