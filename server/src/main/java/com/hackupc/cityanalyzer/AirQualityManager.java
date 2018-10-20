package com.hackupc.cityanalyzer;

import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.XML;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class AirQualityManager {
    static String OPEN_DATA_URL = "http://www.gencat.cat/mediamb/qaire/mapes_qualitat_aire_catalunya/qualitatairecatalunya/qualitatairecatalunya.xml";


    static JSONArray opendataSensors = null;

    public static void getDataFromSources() throws UnirestException {
        HttpResponse<String> soapMessageString = Unirest.get(OPEN_DATA_URL).asString();
        JSONObject jsonInicial = XML.toJSONObject(soapMessageString.getBody());
        opendataSensors = jsonInicial.getJSONObject("ns0:Root").getJSONObject("Valors").getJSONArray("cabina");
    }

    public static Map<String, Object> getPm10Data() {
        List<Object> values = new ArrayList<>();
        if (opendataSensors != null) {
            for (int i = 0; i < opendataSensors.length(); ++i) {
                JSONObject elemento = (JSONObject) opendataSensors.get(i);
                String latitude = elemento.getString("latitud");
                String longitude = elemento.getString("longitud");
                String qualitat_pm10 = elemento.getString("valor_pm10");

                if (!qualitat_pm10.equals("") && !qualitat_pm10.equals("--"))
                    qualitat_pm10 = qualitat_pm10.substring(0, 2);
                else qualitat_pm10 = "0";

                Map<String, Object> sensor = new HashMap<>();
                sensor.put("latitude", latitude);
                sensor.put("longitude", longitude);
                sensor.put("value", Integer.parseInt(qualitat_pm10.trim()));

                values.add(sensor);
            }
        }
        return AWSManager.buildResponseBody("Air Quality - PM10", new Range(0, 100), values);
    }

}
