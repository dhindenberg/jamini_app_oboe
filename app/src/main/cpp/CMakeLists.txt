cmake_minimum_required(VERSION 3.10.2)
project(wavplayer LANGUAGES CXX)

# Oboe mit Prefab finden
find_package(oboe REQUIRED CONFIG)

add_library(wavplayer SHARED wavplayer.cpp)


# Logging
find_library(log-lib log)

# Include-Direktiven (oboe wird durch Prefab gefunden)
target_include_directories(wavplayer
        PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR})

# Bibliotheken linken
target_link_libraries(
        wavplayer
        oboe::oboe  # Prefab-style
        ${log-lib})
