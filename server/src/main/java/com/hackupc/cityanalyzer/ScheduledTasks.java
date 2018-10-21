package com.hackupc.cityanalyzer;


import com.mashape.unirest.http.exceptions.UnirestException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.text.ParseException;

@Component
public class ScheduledTasks {

    @Scheduled(fixedRate = 60000)
    public void updateAirQualityData() throws UnirestException, ParseException {
        AirQualityManager.getDataFromSources();
        AWSManager.pushDataToDynamo(AirQualityManager.getPm10Data());
        AWSManager.pushDataToDynamo(AirQualityManager.getNO2Data());
        AWSManager.pushDataToDynamo(AirQualityManager.getO3Data());
    }

    @Scheduled(fixedRate = 10000)
    private void updateRentalPrices() throws UnirestException, IOException, ParseException {
        RentalHomesManager.getDataFromSources();
        AWSManager.pushDataToDynamo(RentalHomesManager.getRentalPriceData());
    }

    @Scheduled(fixedRate = 86400000)
    private void updateTouristicHomes() throws UnirestException, IOException {
        TouristicHomesManager.getDataFromSources();
        AWSManager.pushDataToDynamo(TouristicHomesManager.getTouristicHomesData());
    }
}
