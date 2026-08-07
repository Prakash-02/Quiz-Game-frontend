package com.quizgame.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LeaderboardEntry {
    private int rank;
    private String id;
    private String name;
    private int score;
    private String teamColor;
    private boolean isTeam;
}
