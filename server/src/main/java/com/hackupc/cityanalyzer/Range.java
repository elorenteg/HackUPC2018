package com.hackupc.cityanalyzer;

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
}
