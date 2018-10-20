package com.hackupc.cityanalyzer;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@SpringBootApplication
@RestController
@EnableScheduling
public class CityAnalyzerApplication {

    public static void main(String[] args) {

        SpringApplication.run(CityAnalyzerApplication.class, args);

    }

    @GetMapping("/pm10")
    private Map<String, Object> pm10() {
        return AirQualityManager.getPm10Data();
    }
}