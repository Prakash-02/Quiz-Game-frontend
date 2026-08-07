package com.quizgame.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class JoinRoomRequest {
    @NotBlank
    @Size(min = 1, max = 32)
    private String nickname;
}
