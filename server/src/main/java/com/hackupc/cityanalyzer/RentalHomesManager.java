package com.hackupc.cityanalyzer;

import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.text.ParseException;
import java.util.*;

public class RentalHomesManager {

    static String OPEN_DATA_URL = "http://opendata-ajuntament.barcelona.cat/data/dataset/a77103f1-f9d1-46ea-8adc-9e96c3ff1888/resource/ae529e85-4962-4326-a522-0f9c3b5fc300/download/ll2017.csv";


    private static List<Object> meanRentalHomePrizeByNeibourhood;
    private static Map<String, Location> barris;


    public static void getDataFromSources() {
        try {
            getAllBarriLocations();
            DecimalFormat df = new DecimalFormat("##.######");
            NumberFormat format = NumberFormat.getInstance(Locale.FRANCE);

            InputStream in = Unirest.get(OPEN_DATA_URL).asString().getRawBody();
            Reader reader = new InputStreamReader(in);
            CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT);

            List<Object> values = new ArrayList<>();

            for (CSVRecord csvRecord : csvParser) {
                if (csvRecord.getRecordNumber() > 2) {
                    String barri = csvRecord.get(1);
                    Location location = barris.get(barri);
                    if (location == null) System.out.println(csvRecord.toString());
                    String priceString = csvRecord.get(2);
                    Number price = 0;
                    if (!priceString.equals("nd")) price = Math.round(format.parse(priceString).doubleValue());

                    Map<String, Object> sensor = new HashMap<>();
                    sensor.put("lat", df.format(location.lat));
                    sensor.put("lon", df.format(location.lon));
                    sensor.put("val", price);
                    values.add(sensor);
                }
            }

            meanRentalHomePrizeByNeibourhood = values;
        } catch (ParseException | IOException | UnirestException e) {
            e.printStackTrace();
        }
    }

    private static void getAllBarriLocations() throws IOException {

        Resource resource = new ClassPathResource("districtes_i_barris_extednded_comas.csv");
        InputStream in = resource.getInputStream();
        Reader reader = new InputStreamReader(in);
        CSVParser csvParser = new CSVParser(reader, CSVFormat.EXCEL.withHeader().withDelimiter(';'));

        barris = new HashMap<>();

        for (CSVRecord record : csvParser) {
            if (record.getRecordNumber() != 1) {
                String barriName = record.get(4);
                double latitude = Double.parseDouble(record.get(5));
                double longitude = Double.parseDouble(record.get(6));
                Location location = new Location(latitude, longitude);
                barris.put(barriName, location);
            }
        }
    }

    public static Map<String, Object> getRentalPriceData() {
        return AWSManager.buildResponseBody("Rental Mean Price", new Range(0, 1000), meanRentalHomePrizeByNeibourhood);
    }
}
