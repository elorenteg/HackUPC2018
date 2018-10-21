package com.hackupc.cityanalyzer;

import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.JsonNode;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;
import org.json.JSONObject;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class AWSManager {

    static String AWS_URL = "https://cxi66ge4ng.execute-api.us-east-1.amazonaws.com/prod/";
    static DateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");

    public static void pushDataToDynamo(Map<String, Object> data2push) throws UnirestException {
        JSONObject body = new JSONObject();
        body.put("Item", data2push);

        JSONObject json2Post = new JSONObject();
        json2Post.put("httpMethod", "POST");
        json2Post.put("queryStringParameters", "");
        json2Post.put("body", body);

        HttpResponse<JsonNode> jsonResponse = Unirest.post(AWS_URL)
                .header("accept", "application/json")
                .header("Content-Type", "application/json")
                .body(json2Post)
                .asJson();
        System.out.println("enviado a AWS: " + data2push.get("data_type") + " " + jsonResponse.getStatus());
    }

    static Map<String, Object> buildResponseBody(String data_type, Range range, List<Object> values) {
        Map<String, Object> json2Return = new HashMap<>();
        Date date = new Date();

        json2Return.put("data_type", data_type);
        json2Return.put("range", range.toMap());
        json2Return.put("last_update", dateFormat.format(date));
        json2Return.put("values", values);

        return json2Return;
    }
}
