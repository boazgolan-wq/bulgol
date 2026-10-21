'use strict';
const LEAGUES={
 il:{he:'ליגת העל',en:'Israeli Premier League',teams:['מכבי תל אביב|Maccabi Tel Aviv','מכבי חיפה|Maccabi Haifa','הפועל באר שבע|Hapoel Beer Sheva','בית"ר ירושלים|Beitar Jerusalem','הפועל תל אביב|Hapoel Tel Aviv','מכבי נתניה|Maccabi Netanya','בני סכנין|Bnei Sakhnin','הפועל חיפה|Hapoel Haifa','הפועל ירושלים|Hapoel Jerusalem','הפועל פתח תקווה|Hapoel Petah Tikva','מכבי פתח תקווה|Maccabi Petah Tikva','הפועל רמת גן|Hapoel Ramat Gan','עירוני קריית שמונה|Hapoel Ironi Kiryat Shmona','עירוני טבריה|Ironi Tiberias']},
 epl:{he:'פרמייר ליג',en:'Premier League',teams:['מנצ\'סטר סיטי|Man City','ארסנל|Arsenal','ליברפול|Liverpool','צ\'לסי|Chelsea','מנצ\'סטר יונייטד|Man United','טוטנהאם|Tottenham']},
 liga:{he:'לה ליגה',en:'La Liga',teams:['ריאל מדריד|Real Madrid','ברצלונה|Barcelona','אתלטיקו מדריד|Atlético Madrid','סביליה|Sevilla']},
 seriea:{he:'סרייה A',en:'Serie A',teams:['אינטר|Inter','מילאן|Milan','יובנטוס|Juventus','נאפולי|Napoli','רומא|Roma']},
 bund:{he:'בונדסליגה',en:'Bundesliga',teams:['באיירן מינכן|Bayern Munich','בורוסיה דורטמונד|Dortmund','לברקוזן|Leverkusen','לייפציג|Leipzig']},
 l1:{he:'ליגה 1',en:'Ligue 1',teams:['פ.ס.ז\'|PSG','מארסיי|Marseille','ליון|Lyon','מונאקו|Monaco']}};
const PLAYERS=['שחקן 9|Striker #9','שחקן 10|Playmaker #10','שחקן 7|Winger #7','שחקן 11|Winger #11','בלם 4|Defender #4','קשר 8|Midfielder #8'];
const FRIENDS=['דני','יוסי','מאיה','ליאם','רוני','עומר'];
const BADGES=[['first','🎯','ניחוש ראשון','First pick'],['exact','💯','תוצאה מדויקת','Exact score'],['ball','⚽','כדור המשחק','Ball of the Match'],['joker','🃏','ג\'וקר מנצח','Winning joker'],['bold','🔥','ניחוש נועז','Bold pick'],['duel','⚔️','ניצחון בדו־קרב','Duel win'],['chat','💬','אוהד פעיל','Chatty fan'],['live','📡','ניחוש בלייב','Live pick'],['season','🏆','גביע עונה','Season trophy']];
