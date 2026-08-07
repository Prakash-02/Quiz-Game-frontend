package com.quizgame.dto;

import com.quizgame.model.GameRoom.GameMode;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SetModeRequest {
    @NotNull
    private GameMode mode;

    @Min(2) @Max(4)
    private int teamCount = 2;
}
