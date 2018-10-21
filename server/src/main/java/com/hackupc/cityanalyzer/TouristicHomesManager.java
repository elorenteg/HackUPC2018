package com.hackupc.cityanalyzer;

import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.XML;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TouristicHomesManager {

    static String OPEN_DATA_URL = "http://opendata-ajuntament.barcelona.cat/data/dataset/c748799e-1079-44b1-9e60-88d936a3fe70/resource/b32fa7f6-d464-403b-8a02-0292a64883bf/download";

    private static List<Object> opendataTouristicHomes;


    public static void getDataFromSources() throws UnirestException, IOException {
        InputStream in = Unirest.get(OPEN_DATA_URL).asString().getRawBody();
        DecimalFormat df = new DecimalFormat("##.######");

        Reader reader = new InputStreamReader(in);
        CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT);
        List<Object> values = new ArrayList<>();

        for (CSVRecord csvRecord : csvParser) {
            // Accessing Values by Column Index
            String longitude = csvRecord.get(15);
            String latitude = csvRecord.get(16);
            if (!longitude.equals("LONGITUD_X")) {
                Map<String, Object> sensor = new HashMap<>();
                sensor.put("lat", df.format(Double.parseDouble(latitude)));
                sensor.put("lon", df.format(Double.parseDouble(longitude)));
                sensor.put("val", 1);
                values.add(sensor);
            }

        }

        opendataTouristicHomes = values;
    }

    public static Map<String, Object> getTouristicHomesData() {
        return AWSManager.buildResponseBody("Touristic Homes", new Range(0, 1), opendataTouristicHomes);
    }
}
