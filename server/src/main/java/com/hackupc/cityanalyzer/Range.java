package com.hackupc.cityanalyzer;

import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class Range {
    int min;
    int max;
    public Range(int min, int max) {
        this.min = min;
        this.max = max;
    }

    @Override
    public String toString() {
        return "["+min+","+max+"]";
    }

    public Map<String, Object>  toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("min",min);
        map.put("max",max);
        return map;
    }
}
