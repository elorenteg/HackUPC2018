package com.hackupc.cityanalyzer;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;
import java.util.Map;

@SpringBootApplication
@RestController
@EnableScheduling
public class CityAnalyzerApplication {

    public static void main(String[] args) {

        SpringApplication.run(CityAnalyzerApplication.class, args);

    }

    @GetMapping("/pm10")
    private Map<String, Object> pm10() throws ParseException {
        return AirQualityManager.getPm10Data();
    }

    @GetMapping("/no2")
    private Map<String, Object> no2() throws ParseException {
        return AirQualityManager.getNO2Data();
    }

    @GetMapping("/o3")
    private Map<String, Object> o3() throws ParseException {
        return AirQualityManager.getO3Data();
    }

    @GetMapping("/touristic")
    private Map<String, Object> touristic() {
        return TouristicHomesManager.getTouristicHomesData();
    }
}