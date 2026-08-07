package com.quizgame.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "teams")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private GameRoom room;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String color;

    @Builder.Default
    private int totalScore = 0;

    @JsonIgnore
    @OneToMany(mappedBy = "team")
    @Builder.Default
    private List<Player> members = new ArrayList<>();
}
