package com.hackupc.cityanalyzer;

import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.XML;

import java.text.NumberFormat;
import java.text.ParseException;
import java.util.*;

public class AirQualityManager {
    static String OPEN_DATA_URL = "http://www.gencat.cat/mediamb/qaire/mapes_qualitat_aire_catalunya/qualitatairecatalunya/qualitatairecatalunya.xml";


    static JSONArray opendataSensors = null;

    public static void getDataFromSources() throws UnirestException {
        HttpResponse<String> soapMessageString = Unirest.get(OPEN_DATA_URL).asString();
        JSONObject jsonInicial = XML.toJSONObject(soapMessageString.getBody());
        opendataSensors = jsonInicial.getJSONObject("ns0:Root").getJSONObject("Valors").getJSONArray("cabina");
    }

    public static Map<String, Object> getData(String airQualityKPI, String kpilabelString) throws ParseException {
        List<Object> values = new ArrayList<>();
        if (opendataSensors != null) {
            for (int i = 0; i < opendataSensors.length(); ++i) {
                JSONObject elemento = (JSONObject) opendataSensors.get(i);
                String latitude = elemento.getString("latitud");
                String longitude = elemento.getString("longitud");
                String kpiString = elemento.getString(airQualityKPI);

                if (!kpiString.equals("") && !kpiString.equals("--"))
                    kpiString = kpiString.substring(0, kpiString.indexOf(" "));
                else kpiString = "0";

                String valueString = kpiString.trim();
                NumberFormat format = NumberFormat.getInstance(Locale.FRANCE);
                Number number = format.parse(valueString);
                int kpiIntValue = (int) Math.round(number.doubleValue());

                Map<String, Object> sensor = new HashMap<>();
                sensor.put("latitude", latitude);
                sensor.put("longitude", longitude);
                sensor.put("value", kpiIntValue);

                values.add(sensor);
            }
        }
        return AWSManager.buildResponseBody("Air Quality - " + kpilabelString, new Range(0, 100), values);
    }

    public static Map<String, Object> getPm10Data() throws ParseException {
        return getData("valor_pm10", "PM10");
    }

    public static Map<String, Object> getNO2Data() throws ParseException {
        return getData("valor_no2", "NO2");
    }

    public static Map<String, Object> getO3Data() throws ParseException {
        return getData("valor_o3", "O3");
    }

}
