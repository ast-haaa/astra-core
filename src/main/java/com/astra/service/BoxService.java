package com.astra.service;

import com.astra.model.Box;
import com.astra.repository.AlertRepository;
import com.astra.repository.BoxRepository;
import com.astra.repository.DeviceStateRepository;
import com.astra.repository.TelemetrySnapshotRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BoxService {

    private final BoxRepository boxRepository;

    public BoxService(BoxRepository boxRepository) {
        this.boxRepository = boxRepository;
    }

    public Box save(Box box) { return boxRepository.save(box); }

    public Optional<Box> findById(String boxId) { return boxRepository.findById(boxId); }

    public List<Box> findAll() { return boxRepository.findAll(); }

    public void delete(String boxId) { boxRepository.deleteById(boxId); }
}


