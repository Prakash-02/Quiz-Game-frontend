package com.quizgame.dto;

import com.quizgame.model.GameRoom.GameMode;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class LobbyState {
    private String roomCode;
    private GameMode mode;
    private int teamCount;
    private List<PlayerInfo> players;
    private List<TeamInfo> teams;

    @Data
    @Builder
    public static class PlayerInfo {
        private String id;
        private String nickname;
        private String teamId;
        private String teamName;
        private String teamColor;
        private boolean connected;
    }

    @Data
    @Builder
    public static class TeamInfo {
        private String id;
        private String name;
        private String color;
        private List<String> memberNicknames;
    }
}
