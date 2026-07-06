import pytest
import pandas as pd
import numpy as np

# Fungsi tiruan (Mock) untuk mendemonstrasikan penghitungan statistik
def calculate_statistics(df_raw: pd.DataFrame):
    df_pivoted = df_raw.pivot_table(
        index="application_id", 
        columns="sub_aspect_code", 
        values="score"
    )
    medians = df_pivoted.median().to_dict()
    stds = df_pivoted.std().to_dict()
    return medians, stds

# DATA UJI MOCK
@pytest.fixture
def sample_testing_data():
    data = [
        {"application_id": 1, "sub_aspect_code": "KEDAI", "score": 90.0},
        {"application_id": 1, "sub_aspect_code": "KELCH", "score": 80.0},
        {"application_id": 2, "sub_aspect_code": "KEDAI", "score": 92.0},
        {"application_id": 2, "sub_aspect_code": "KELCH", "score": 86.0},
        {"application_id": 3, "sub_aspect_code": "KEDAI", "score": 88.0},
        {"application_id": 3, "sub_aspect_code": "KELCH", "score": 84.0},
    ]
    return pd.DataFrame(data)

# TEST CASE 1: Memverifikasi perhitungan median
def test_median_calculation(sample_testing_data):
    medians, _ = calculate_statistics(sample_testing_data)
    
    # KEDAI scores: [90.0, 92.0, 88.0] -> Median should be 90.0
    # KELCH scores: [80.0, 86.0, 84.0] -> Median should be 84.0
    assert medians["KEDAI"] == pytest.approx(90.0)
    assert medians["KELCH"] == pytest.approx(84.0)

# TEST CASE 2: Memverifikasi perhitungan standar deviasi
def test_std_deviation_calculation(sample_testing_data):
    _, stds = calculate_statistics(sample_testing_data)
    
    # Standar deviasi sampel untuk KEDAI [90, 92, 88] is 2.0
    assert stds["KEDAI"] == pytest.approx(2.0)
    
    # Standar deviasi sampel untuk KELCH [80, 86, 84] is ~3.055
    assert stds["KELCH"] == pytest.approx(3.05505, abs=1e-3)
