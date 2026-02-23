import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import SecureStoreModel from "../constants/SecureStoreModel";
import Yearbtn from "../components/Yearbtn";
import ChipNav from "../components/ChipNav";
import DiaryList from "../components/DiaryList";
import SearchBar from "../components/SearchBar";
import { getAllDiaries, searchDiaries } from "../constants/Database";
import { DContexts } from "../contexts/DContexts";
import { useState, useEffect, useContext } from "react";
import NoResultComponent from "../components/NoResultComponent";
import useStyles from "../constants/styles";
import Dashboard from "../components/Dashboard";

export default function Home() {
  const date = new Date();
  const monthIndex = date.getMonth();
  const css = useStyles();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const monthName = monthNames[monthIndex];
  const currentMonthIndex = monthNames.indexOf(monthName);
  const rearrangedMonths = [
    ...monthNames.slice(currentMonthIndex),
    ...monthNames.slice(0, currentMonthIndex),
  ];
  const currentYear = date.getFullYear();
  const pastTenYears = [];
  for (let i = 0; i < 10; i++) pastTenYears.push(currentYear - i);

  const [yearfilter, setyearfilter] = useState(currentYear);
  const [monthfilter, setmonthfilter] = useState(monthName);
  const [diaries, setDiaries] = useState([]);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const { changedsomething, primarycolor, myuname, bgcolor, setbgColor, setCardColor, settxtColor } =
    useContext(DContexts);

  useEffect(() => {
    getAllDiaries(yearfilter, monthfilter)
      .then((diary) => setDiaries(diary))
      .catch((error) => console.error("Failed to get diaries:", error));
  }, [yearfilter, monthfilter, changedsomething]);

  // Live search
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      searchDiaries(searchQuery.trim())
        .then((results) => setSearchResults(results))
        .catch(console.error);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const lightmode = bgcolor === "#f5f5f5";

  const changeTheme = () => {
    if (lightmode) {
      setbgColor("#15202B");
      SecureStoreModel.saveItem("bgcolor", "#15202B");
      setCardColor("#273340");
      settxtColor("white");
      SecureStoreModel.saveItem("cardcolor", "#273340");
      SecureStoreModel.saveItem("textcolor", "white");
    } else {
      setbgColor("#f5f5f5");
      SecureStoreModel.saveItem("bgcolor", "#f5f5f5");
      setCardColor("white");
      settxtColor("black");
      SecureStoreModel.saveItem("cardcolor", "white");
      SecureStoreModel.saveItem("textcolor", "black");
    }
  };

  const closeSearch = () => {
    setSearchMode(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const displayDiaries = searchMode && searchQuery.length > 1
    ? searchResults
    : diaries;

  return (
    <>
      <StatusBar translucent backgroundColor={primarycolor} barStyle="light-content" />
      <ScrollView style={css.container}>
        {/* Top Nav */}
        <View style={styles.topnav}>
          <View>
            <Text style={{ ...styles.tpn1, ...css.txt }}>Good day!</Text>
            <Text style={{ ...styles.tpn2, ...css.txt }}>{myuname}</Text>
          </View>
          <View style={styles.topActions}>
            {/* Search toggle */}
            <TouchableOpacity
              onPress={() => setSearchMode(!searchMode)}
              style={styles.iconBtn}
            >
              <Ionicons
                name={searchMode ? "close-outline" : "search-outline"}
                style={{ fontSize: 24 }}
                color={primarycolor}
              />
            </TouchableOpacity>
            {/* Theme toggle */}
            <TouchableOpacity onPress={changeTheme} style={styles.iconBtn}>
              <Ionicons
                name={lightmode ? "moon-outline" : "sunny"}
                style={{ fontSize: 24 }}
                color={primarycolor}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        {searchMode && (
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClose={closeSearch}
          />
        )}

        {/* Dashboard (hidden during search) */}
        {!searchMode && <Dashboard />}

        {/* Year & Month filters (hidden during search) */}
        {!searchMode && (
          <>
            <View>
              <ScrollView showsHorizontalScrollIndicator={false} style={{ flexDirection: "row" }} horizontal>
                <View style={{ marginLeft: 15 }} />
                {pastTenYears.map((year) => (
                  <TouchableOpacity onPress={() => setyearfilter(year)} key={year}>
                    <Yearbtn year={year} active={year === yearfilter} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View>
              <ScrollView showsHorizontalScrollIndicator={false} style={{ flexDirection: "row" }} horizontal>
                <View style={{ marginLeft: 15 }} />
                {rearrangedMonths.map((month) => (
                  <TouchableOpacity key={month} onPress={() => setmonthfilter(month)}>
                    <ChipNav name={month} active={month === monthfilter} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        )}

        {/* Search results header */}
        {searchMode && searchQuery.length > 1 && (
          <Text style={[css.greytext, { paddingHorizontal: 14, marginTop: 8 }]}>
            {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for "{searchQuery}"
          </Text>
        )}

        {/* Diary List */}
        {displayDiaries.length > 0 ? (
          displayDiaries.map((diary, index) => (
            <DiaryList
              key={diary.id || index}
              id={diary.id}
              title={diary.title}
              timestamp={diary.timestamp}
              data={diary}
            />
          ))
        ) : (
          <NoResultComponent />
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  topnav: {
    padding: 5,
    borderRadius: 10,
    margin: 10,
    marginTop: 10,
    marginBottom: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tpn1: {
    fontSize: 13,
    color: "grey",
  },
  tpn2: {
    fontSize: 24,
    fontWeight: "bold",
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconBtn: {
    padding: 6,
  },
});
