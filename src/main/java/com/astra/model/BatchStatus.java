package com.astra.model;

public enum BatchStatus {
    PENDING,        // lab ne test nahi kiya
    APPROVED,       // lab ne pass kiya
    REJECTED,       // lab ne fail kiya
    RECALLED        // reject ke baad recall ho gaya
}
