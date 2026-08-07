package com.quizgame.repository;

import com.quizgame.model.GameRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface GameRoomRepository extends JpaRepository<GameRoom, String> {
    Optional<GameRoom> findByRoomCode(String roomCode);
    boolean existsByRoomCode(String roomCode);
}
