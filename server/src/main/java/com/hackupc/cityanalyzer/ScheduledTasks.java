package com.hackupc.cityanalyzer;


import com.mashape.unirest.http.exceptions.UnirestException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ScheduledTasks {

    @Scheduled(fixedRate = 30000)
    public void updateAirQualityData() throws UnirestException {
        AirQualityManager.getDataFromSources();
        AWSManager.pushDataToDynamo(AirQualityManager.getPm10Data());
    }
}
