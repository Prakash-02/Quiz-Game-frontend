package com.quizgame.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "game_rooms")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GameRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true, length = 8)
    private String roomCode;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(nullable = false)
    private String hostSessionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private GameMode mode = GameMode.INDIVIDUAL;

    @Builder.Default
    private int teamCount = 2;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private GameStatus status = GameStatus.LOBBY;

    @Builder.Default
    private int currentQuestionIndex = -1;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @JsonIgnore
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Player> players = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Team> teams = new ArrayList<>();

    @PrePersist
    void prePersist() {
        this.createdAt = Instant.now();
    }

    public enum GameMode {
        INDIVIDUAL, TEAM
    }

    public enum GameStatus {
        LOBBY, IN_PROGRESS, FINISHED
    }
}
