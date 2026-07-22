const BRANCHES={
 number:{name:'數感與運算',icon:'✦',color:'#f6b94a',summary:'建立數量、運算、比例、估算與數值結構的底層能力。'},
 algebra:{name:'代數與方程',icon:'◇',color:'#7fc8ff',summary:'把關係抽象成符號，利用方程、多項式與結構處理未知量。'},
 geometry:{name:'幾何與測量',icon:'△',color:'#84e0b3',summary:'理解形狀、角度、空間、尺度與圖形之間的關係。'},
 functions:{name:'函數與圖像',icon:'↗',color:'#b89cff',summary:'在表格、圖像、公式與情境間切換，描述變量如何互相影響。'},
 statistics:{name:'統計與機率',icon:'▦',color:'#ff9f9f',summary:'從資料與不確定性中分析分布、風險與可能性。'},
 logic:{name:'邏輯與證明',icon:'⌘',color:'#ffd479',summary:'建立條件判斷、反例、證明鏈與策略推理能力。'},
 modeling:{name:'建模與應用',icon:'⚙',color:'#77d9dd',summary:'把真實世界的問題轉成模型，驗證結果並清楚溝通限制。'}
};
const TYPE_ICON={core:'◆',concept:'●',technique:'▲',application:'◇',boss:'★'};
const TYPE_NAME={core:'核心節點',concept:'概念節點',technique:'技術節點',application:'應用節點',boss:'整合挑戰'};
const S=[];
function add(id,title,branch,level,type,grade,prereqs,tags,desc,example){
 S.push({id,title,branch,level,type,grade,prereqs:prereqs||[],tags:tags||[],desc,example,
 mastery:[`能以自己的話解釋「${title}」`,`能完成基礎題與至少一種變化題`,`能檢查條件、符號、單位與答案合理性`],
 errors:[`只記住${title}的操作，沒有理解適用條件`,`計算過程正確，但忽略定義域、單位或情境限制`]});
}
// 數感與運算
add('number_sense','數量感與大小比較','number',0,'core','小學基礎',[],['數線','比較'],'理解數量的多寡、順序與距離，能在不精算時判斷合理範圍。','比較 398、403、3.98，並說明差距。');
add('place_value','位值與十進位系統','number',1,'concept','小學基礎',['number_sense'],['位值','十進位'],'理解個、十、百、千與小數位值，能拆解與重組數字。','將 5,072.04 寫成位值展開式。');
add('gcd_lcm','質因數與公倍因數','number',2,'technique','國中',['place_value'],['質因數','整除'],'理解整除結構，能選擇最大公因數或最小公倍數解決分組與週期。','每 6 天與每 8 天一次的活動，何時再次同日？');
add('integer_ops','正負數與整數運算','number',2,'technique','國中',['place_value'],['整數','數線'],'以方向、溫度、資產負債與數線理解正負數及四則運算。','計算 −7−(−12)，並以數線說明。');
add('fraction_meaning','分數意義與等值分數','number',2,'concept','小學基礎',['place_value'],['分數','等值'],'把分數理解為部分、除法、比率與數線位置，而不是只看分子分母。','用圖形或數線說明 2/3 為何等於 8/12。');
add('order_ops','運算順序與括號結構','number',3,'core','國中',['integer_ops','fraction_meaning'],['括號','結構'],'辨識括號、乘方、乘除與加減的層級，避免只從左到右硬算。','比較 6÷2(1+2) 的不同結構解讀。');
add('fraction_ops','分數四則運算','number',3,'technique','小學基礎',['fraction_meaning'],['通分','約分'],'理解通分、約分、乘除與帶分數轉換，並先估計答案範圍。','計算 3/4÷2/5，並用估算檢查。');
add('decimal_ops','小數四則與轉換','number',3,'technique','小學基礎',['place_value','fraction_meaning'],['小數','轉換'],'連結小數、分數與百分率，正確處理小數點與位值。','計算 2.4×0.35 並說明小數位數。');
add('powers','指數與乘方','number',4,'concept','國中',['integer_ops','order_ops'],['指數','底數'],'理解重複相乘、底數與指數，分辨負號是否屬於底數。','比較 −3² 與 (−3)²。');
add('ratio','比與比值','number',4,'concept','國中',['fraction_ops','decimal_ops'],['比','相對量'],'理解兩個量的相對關係，先統一單位再化簡與比較。','紅球 6 顆、藍球 9 顆，寫出並化簡比。');
add('estimation','估算、近似與誤差','number',4,'application','國中',['decimal_ops','integer_ops'],['估算','誤差'],'先建立答案範圍，再精算並分析四捨五入與測量誤差。','不精算判斷 19.8×5.1 是否接近 100。');
add('exponent_rules','指數律','number',5,'technique','國中',['powers'],['指數律'],'從重複相乘理解同底數乘除、乘方的乘方與零次方。','說明 a³·a⁵=a⁸ 的原因。');
add('proportion','比例式與比例推理','number',5,'application','國中',['ratio'],['比例式','縮放'],'利用等比關係處理配方、地圖、速率與單位換算。','3 支筆 45 元，8 支筆多少元？');
add('percent','百分率、折扣與成長率','number',5,'application','國中',['ratio','decimal_ops'],['百分率','折扣'],'找出基準量，處理百分比增加、減少、連續折扣與利率。','先漲 20% 再降 20%，是否回到原價？');
add('unit_rate','單位量、速率與密度','number',5,'application','國中',['ratio'],['速率','單位量'],'將複合量轉換成每一單位的比較基準，並追蹤分子分母單位。','180 公里行駛 3 小時，平均速率多少？');
add('roots','平方根與無理數','number',6,'concept','國中',['powers','estimation'],['平方根','無理數'],'理解平方根是平方的逆運算，能估計無理數在數線的位置。','判斷 √50 介於哪兩個整數間。');
add('scientific_notation','科學記號與數量級','number',6,'application','國中',['exponent_rules','decimal_ops'],['科學記號','數量級'],'用 1≤a<10 的形式表示極大或極小數，並比較數量級。','將 0.00042 寫成科學記號。');
add('radical_ops','根式化簡與運算','number',7,'technique','國中',['roots','exponent_rules'],['根式','有理化'],'化簡根式、合併同類根式並理解分母有理化。','化簡 √18+2√8。');
add('modular','餘數、週期與同餘','number',7,'application','競賽',['gcd_lcm','powers'],['餘數','週期'],'利用餘數分類與循環週期處理整除、個位數與規律問題。','求 7^100 的個位數。');
add('number_boss','數感整合挑戰','number',8,'boss','競賽',['proportion','percent','unit_rate','scientific_notation','radical_ops','modular'],['整合','Boss'],'綜合比例、百分率、指數、根式、單位與估算，選擇最有效策略。','設計一份同時符合配方比例、成本與誤差限制的方案。');
// 代數與方程
add('variables','變數與代數語言','algebra',0,'core','國中',['number_sense'],['變數','翻譯'],'理解字母代表可變或未知的數量，把文字關係轉成式子。','將「比 x 的三倍少 5」寫成代數式。');
add('like_terms','同類項與式子化簡','algebra',1,'technique','國中',['variables','order_ops'],['同類項','係數'],'依變數與次方辨識同類項，正確合併係數與常數。','化簡 3x−2+5x+7。');
add('distributive','分配律與去括號','algebra',2,'concept','國中',['like_terms'],['分配律','負號'],'理解乘法對加減的分配，正確處理負號與多層括號。','展開 −2(3x−4)。');
add('linear_eq','一元一次方程式','algebra',3,'technique','國中',['distributive','integer_ops'],['等量公理','方程'],'以等量公理維持平衡，逐步求未知數並代回檢查。','解 3(x−2)=2x+5。');
add('polynomial_basics','多項式結構','algebra',3,'concept','國中',['like_terms','powers'],['項','次數'],'辨識項、係數、次數、常數與降冪排列。','說明 4x³−2x+7 的次數與各項係數。');
add('linear_word','一元一次應用題','algebra',4,'application','國中',['linear_eq','unit_rate','percent'],['列式','應用題'],'定義未知數、建立方程式、解題並檢查答案是否符合情境。','用方程式處理票價、年齡或追趕問題。');
add('linear_ineq','一元一次不等式','algebra',4,'technique','國中',['linear_eq'],['不等式','解集'],'理解解集與邊界，乘除負數時正確改變方向並畫數線。','解 −2x+3>7。');
add('poly_add_sub','多項式加減','algebra',4,'technique','國中',['polynomial_basics','distributive'],['多項式','符號'],'對齊同次項，正確處理多項式加減與括號。','計算 (3x²−x+2)−(x²+4x−1)。');
add('systems','二元一次聯立方程式','algebra',5,'technique','國中',['linear_eq','variables'],['聯立','消去'],'用代入、消去或圖像找出同時滿足兩個條件的解。','解 2x+y=7、x−y=2。');
add('sequences','數列與規律','algebra',5,'concept','國中',['variables','estimation'],['數列','一般項'],'從數字與圖形規律建立遞迴關係或一般項。','找出 2,5,8,11,… 的第 n 項。');
add('poly_multiply','多項式乘法','algebra',5,'technique','國中',['poly_add_sub','exponent_rules'],['展開','乘法'],'使用分配律、表格或面積模型展開多項式。','展開 (2x−3)(x+4)。');
add('systems_word','聯立方程應用','algebra',6,'application','國中',['systems','linear_word'],['兩未知量','建模'],'從兩個未知量與兩個獨立條件建立聯立模型。','由成人票與學生票的總張數、總價求各自數量。');
add('identities','乘法公式','algebra',6,'concept','國中',['poly_multiply'],['平方公式','平方差'],'從幾何與結構理解完全平方與平方差，不只背公式。','用面積圖說明 (a−b)²。');
add('factoring_common','提公因式','algebra',6,'technique','國中',['poly_multiply','gcd_lcm'],['因式分解','公因式'],'找出所有項共有的數與字母因子，並用展開驗證。','因式分解 6x²−9x。');
add('absolute_eq','絕對值方程與不等式','algebra',6,'concept','國中',['linear_eq','integer_ops'],['絕對值','距離'],'以距離理解絕對值，透過分情況處理方程與不等式。','解 |2x−1|=5。');
add('factoring_forms','公式型與十字因式分解','algebra',7,'technique','國中',['identities','factoring_common'],['十字交乘','結構'],'辨識平方差、完全平方與二次三項式結構，選擇適當分解法。','因式分解 x²−5x+6。');
add('arithmetic_geo','等差與等比數列','algebra',7,'technique','高中',['sequences','exponent_rules'],['等差','等比'],'理解公差、公比、一般項與部分和，並辨識線性與指數成長。','求 3,6,12,24,… 的一般項。');
add('quadratic_eq','一元二次方程式','algebra',8,'technique','國中',['factoring_forms','roots'],['二次方程','公式解'],'選擇因式分解、配方法或公式解，處理兩根、重根與無實根。','解 2x²−3x−2=0。');
add('rational_expr','代數分式與定義域','algebra',8,'technique','高中',['factoring_forms','fraction_ops'],['分式','定義域'],'先因式分解再約分與通分，並清楚列出分母不可為零的限制。','化簡 (x²−9)/(x−3)，並寫出限制。');
add('quadratic_word','二次方程應用','algebra',9,'application','國中',['quadratic_eq','linear_word'],['面積','最佳化'],'建立二次模型並刪除不符合情境限制的解。','由長方形面積與周長關係求邊長。');
add('algebra_boss','代數結構整合挑戰','algebra',10,'boss','高中',['quadratic_eq','rational_expr','absolute_eq','arithmetic_geo'],['整合','Boss'],'在方程、不等式、多項式、數列與分式中辨識結構並選擇有效解法。','比較兩種收費方案，求出臨界點與適用區間。');
// 幾何
add('measure_units','長度、面積與體積單位','geometry',0,'core','小學基礎',['place_value'],['單位','量綱'],'理解長度、面積與體積是不同量綱，正確處理平方與立方單位。','說明 1 m² 為何等於 10,000 cm²。');
add('angles','角度與角的關係','geometry',1,'concept','國中',['measure_units'],['角度','互補'],'辨識銳角、直角、鈍角、平角、對頂角、互餘與互補。','利用對頂角或互補關係求未知角。');
add('solids','立體圖形與展開圖','geometry',1,'concept','國中',['measure_units'],['立體','展開圖'],'連結二維展開圖、三視圖與三維立體的面、稜與頂點。','判斷一張展開圖能否摺成正方體。');
add('parallel_lines','平行線與截角','geometry',2,'concept','國中',['angles'],['同位角','內錯角'],'理解同位角、內錯角、同側內角與平行判定。','由內錯角相等推出兩直線平行。');
add('triangle_sum','三角形內外角','geometry',2,'concept','國中',['angles'],['三角形','外角'],'運用內角和、外角定理與三角不等式。','已知兩內角 35°、65°，求第三角。');
add('area_tri_quad','三角形與四邊形面積','geometry',2,'technique','國中',['measure_units','angles'],['面積','高'],'理解底與高的對應，處理三角形、平行四邊形、梯形與菱形。','拆解複合四邊形並計算面積。');
add('polygon','多邊形與角度','geometry',3,'concept','國中',['triangle_sum'],['多邊形','內角和'],'透過三角剖分推導多邊形內角和與外角和。','推導 n 邊形內角和公式。');
add('triangle_congruence','全等三角形','geometry',3,'concept','國中',['triangle_sum','parallel_lines'],['SSS','SAS'],'掌握 SSS、SAS、ASA、AAS、RHS，並正確對應頂點。','用兩邊夾角證明兩三角形全等。');
add('surface_volume','表面積與體積','geometry',3,'technique','國中',['solids','area_tri_quad'],['表面積','體積'],'區分表面積與體積，處理柱體、錐體、球體及複合立體。','計算有缺口的複合柱體表面積。');
add('transformations','平移、旋轉與鏡射','geometry',3,'concept','國中',['angles','coordinate_plane'],['變換','對稱'],'理解剛體變換對位置、方向、長度與角度的影響。','寫出點 (x,y) 對 y 軸鏡射後的座標。');
add('circle_basics','圓、弦、弧與圓周角','geometry',3,'concept','國中',['angles','measure_units'],['圓','圓周角'],'理解半徑、直徑、弦、弧、圓心角與圓周角的關係。','由同弧所對圓周角求未知角。');
add('triangle_similarity','相似三角形','geometry',4,'concept','國中',['triangle_congruence','ratio'],['相似','比例'],'掌握 AA、SAS、SSS 相似，建立正確對應比。','利用影長與相似三角形測量樹高。');
add('pythagorean','畢氏定理與逆定理','geometry',4,'technique','國中',['triangle_sum','powers'],['直角三角形','平方'],'使用三邊平方關係求長度，或判斷三角形是否為直角。','檢查邊長 5、12、13 是否為直角三角形。');
add('circle_measure','圓周、面積與扇形','geometry',4,'technique','國中',['circle_basics','ratio'],['弧長','扇形'],'以圓心角占整圓的比例處理弧長與扇形面積。','求 60° 扇形的弧長與面積。');
add('coordinate_geometry','座標幾何','geometry',5,'application','國中',['pythagorean','slope'],['距離','中點'],'用座標計算距離、中點、斜率與圖形關係，在代數與幾何間轉換。','由三個座標判斷是否構成直角三角形。');
add('circle_theorems','切線與圓幾何定理','geometry',5,'concept','高中',['circle_basics','triangle_similarity'],['切線','幂'],'處理切線、弦、圓周角與相交線段，懂得建立輔助線。','利用切點半徑垂直切線完成證明。');
add('trig_ratio','直角三角比','geometry',5,'concept','高中',['triangle_similarity','pythagorean'],['sin','cos','tan'],'把三角比理解為相似直角三角形的固定邊長比。','利用仰角與 tan 求建築物高度。');
add('geometric_proof','幾何證明策略','geometry',6,'application','國中',['triangle_congruence','triangle_similarity','circle_theorems'],['證明','輔助線'],'從已知、求證、圖形關係與理由組成可檢查的證明鏈。','證明兩線平行、兩角相等或兩段等長。');
add('vector_geometry','向量與幾何','geometry',6,'concept','高中',['coordinate_geometry','trig_ratio'],['向量','內積'],'用方向與大小描述位移，處理分量、加法、內積與投影。','用內積判斷兩個非零向量是否垂直。');
add('geometry_boss','幾何整合挑戰','geometry',7,'boss','高中',['coordinate_geometry','circle_measure','trig_ratio','geometric_proof','surface_volume'],['整合','Boss'],'結合全等、相似、圓、座標、三角比與立體量測解決複合問題。','設計一個在容量固定下最省材料的容器。');
// 函數
add('coordinate_plane','座標平面與象限','functions',0,'core','國中',['integer_ops'],['座標','象限'],'理解有序數對、座標軸、象限與點的位置。','說明點 (−3,2) 位於哪個象限。');
add('relation_function','關係與函數概念','functions',1,'concept','國中',['variables','coordinate_plane'],['輸入','輸出'],'理解一個輸入只能對應一個輸出，分辨關係與函數。','用垂直線測試判斷圖形是否為函數。');
add('slope','變化率與斜率','functions',2,'concept','國中',['relation_function','ratio'],['斜率','變化率'],'理解 x 每增加一單位時 y 改變多少，能從兩點求斜率。','由兩點座標計算斜率並解釋正負。');
add('graph_interpret','圖表判讀與故事化','functions',2,'application','國中',['coordinate_plane','estimation'],['圖表','趨勢'],'從圖像讀取趨勢、交點、最大最小、停留與變化速度。','解釋一張路程—時間圖中的停留區段。');
add('linear_function','一次函數','functions',3,'technique','國中',['slope','linear_eq'],['斜率','截距'],'連結 y=mx+b、圖像、斜率、截距與實際情境。','建立計程車費用的一次函數。');
add('direct_inverse','正比與反比','functions',3,'concept','國中',['relation_function','proportion'],['正比','反比'],'辨識 y=kx 與 y=k/x 的表格、圖像與情境差異。','固定距離下，說明速度與時間為何成反比。');
add('piecewise','分段函數','functions',4,'concept','高中',['linear_function','linear_ineq'],['分段','邊界'],'依不同條件使用不同規則，正確處理區間與開閉端點。','用分段函數表示階梯費率。');
add('quadratic_function','二次函數與拋物線','functions',5,'concept','國中',['linear_function','quadratic_eq'],['頂點','對稱軸'],'理解開口、頂點、對稱軸、截距與係數對圖形的影響。','由 y=(x−2)²−3 判讀頂點與開口。');
add('functions_exp','指數函數','functions',5,'concept','高中',['exponent_rules','relation_function'],['倍增','衰減'],'描述固定倍率成長或衰減，理解初值、底數與成長率。','建立每年成長 5% 的人口模型。');
add('function_transform','函數圖形變換','functions',6,'concept','高中',['quadratic_function','transformations'],['平移','伸縮'],'由母函數理解水平、垂直平移、伸縮與對稱。','說明 y=2f(x−3)+1 的圖形變化。');
add('inverse_function','反函數','functions',7,'concept','高中',['relation_function','function_transform'],['反函數','一對一'],'交換輸入與輸出，利用 y=x 對稱並檢查一對一條件。','求 f(x)=2x+3 的反函數。');
add('rate_change','平均變化率與瞬時直覺','functions',7,'concept','高中',['slope','quadratic_function'],['割線','逼近'],'從割線斜率理解平均變化率，並建立瞬時變化的逼近直覺。','比較函數在不同區間的平均變化率。');
add('function_model','函數建模','functions',8,'application','高中',['graph_interpret','quadratic_function','functions_exp'],['模型','擬合'],'從資料選擇線性、二次、指數或分段模型，說明參數與限制。','比較線性與指數模型對同一組資料的適合度。');
add('function_boss','函數整合挑戰','functions',9,'boss','高中',['piecewise','inverse_function','rate_change','function_model'],['整合','Boss'],'在文字、表格、圖像與公式間切換，建立可解釋且有限制的函數模型。','設計一個階梯費率，分析公平性與臨界點。');
// 統計與機率
add('data_types','資料型態與蒐集','statistics',0,'core','國中',['number_sense'],['樣本','母體'],'分辨類別、順序、離散與連續資料，理解母體、樣本與抽樣。','為通勤方式與通勤時間選擇資料型態。');
add('tables_charts','表格與圖表','statistics',1,'technique','國中',['data_types','percent'],['長條圖','直方圖'],'選擇長條圖、折線圖、圓餅圖、直方圖或箱型圖，辨識誤導尺度。','為身高資料選擇合適圖表。');
add('center','平均數、中位數與眾數','statistics',2,'concept','國中',['tables_charts','fraction_ops'],['中心量','平均'],'理解不同中心量的意義，以及離群值對平均數的影響。','說明薪資資料為何常用中位數。');
add('prob_basic','機率與樣本空間','statistics',2,'core','國中',['fraction_meaning','data_types'],['事件','樣本空間'],'完整列出樣本空間，判斷結果是否等可能並計算事件機率。','列出擲兩枚硬幣的樣本空間。');
add('counting','樹狀圖與計數原理','statistics',3,'technique','國中',['prob_basic','order_ops'],['樹狀圖','乘法原理'],'使用系統列舉、加法原理與乘法原理避免漏算與重算。','3 件上衣與 2 件褲子共有幾種搭配？');
add('boxplot','箱型圖與離群值','statistics',3,'technique','國中',['center'],['四分位數','離群值'],'利用五數摘要、四分位距與箱型圖比較資料分布。','由箱型圖判斷中位數、偏態與離群值。');
add('spread','全距、四分位距與標準差','statistics',4,'concept','高中',['center','roots'],['散布','標準差'],'描述資料的散布與穩定程度，比較中心相同但變異不同的分布。','兩班平均相同時，用標準差比較穩定度。');
add('sampling_bias','抽樣、偏誤與因果','statistics',4,'application','高中',['data_types','tables_charts'],['抽樣','偏誤'],'辨識便利抽樣、問題措辭、相關與因果推論的限制。','評估只在補習班調查學習時間的偏誤。');
add('perm_comb','排列與組合','statistics',5,'technique','高中',['counting','sequences'],['排列','組合'],'依是否考慮順序、是否重複選取，選擇排列或組合。','從 10 人選 3 人組成委員會。');
add('conditional_prob','條件機率','statistics',5,'concept','高中',['prob_basic','counting'],['條件機率','樹狀圖'],'在已知條件下重新縮小樣本空間，分辨 P(A|B) 與 P(B|A)。','已知抽到紅球，判斷它來自哪個盒子的機率。');
add('independence','獨立與互斥事件','statistics',6,'concept','高中',['conditional_prob'],['獨立','互斥'],'判斷事件是否互相影響，清楚區分互斥與獨立。','比較擲硬幣、擲骰子與抽牌事件。');
add('expected_value','期望值與公平遊戲','statistics',6,'application','高中',['prob_basic','center'],['期望值','風險'],'用機率加權平均評估長期報酬、成本與遊戲公平性。','計算抽獎遊戲的期望淨收益。');
add('stats_boss','統計機率整合挑戰','statistics',7,'boss','高中',['spread','boxplot','perm_comb','independence','expected_value','sampling_bias'],['整合','Boss'],'設計調查、分析資料、量化風險，並清楚說明偏誤與不確定性。','評估一項校園政策是否有效，提出資料證據。');
// 邏輯與證明
add('patterns','觀察規律與分類','logic',0,'core','小學基礎',['number_sense'],['規律','分類'],'從數字、圖形與操作中找共同特徵、變化規律與例外。','找出下一個圖形，並提出可檢驗規則。');
add('statements','命題與真假','logic',1,'concept','國中',['patterns','variables'],['命題','真假'],'辨識可判定真假的陳述，分辨命題、開放句與定義域。','判斷「所有質數都是奇數」的真假。');
add('definitions','定義、定理與性質','logic',2,'core','國中',['statements'],['定義','定理'],'分辨定義、已證定理、性質、猜想與例子在推理中的角色。','用偶數定義將 n 寫成 2k。');
add('and_or_not','且、或、非','logic',2,'concept','高中',['statements'],['真值表','否定'],'掌握邏輯連接詞與否定範圍，能建立簡單真值表。','寫出「A 且 B」的否定。');
add('counterexample','反例能力','logic',2,'technique','國中',['statements'],['反例','全稱命題'],'用一個符合前提、但不符合結論的例子推翻全稱命題。','用 2 反駁「所有質數都是奇數」。');
add('conditionals','充分、必要與條件命題','logic',3,'concept','高中',['and_or_not'],['充分條件','必要條件'],'理解 P⇒Q 的方向，分辨充分條件與必要條件。','說明「正方形」與「長方形」的條件關係。');
add('converse_inverse','逆、否與逆否命題','logic',4,'concept','高中',['conditionals'],['逆否命題','等價'],'正確轉換逆命題、否命題與逆否命題，理解逆否與原命題等價。','寫出「若 n² 為偶數，則 n 為偶數」的逆否命題。');
add('direct_proof','直接證明','logic',4,'technique','高中',['conditionals','definitions'],['證明','推理鏈'],'從定義與已知條件逐步推出結論，每一步都附上理由。','證明兩個偶數相加仍為偶數。');
add('proof_structure','證明鏈與理由書寫','logic',5,'application','高中',['direct_proof','counterexample'],['已知','求證'],'把已知、目標、中間命題與理由組成可檢查、無跳步的推理鏈。','找出一份幾何證明中的邏輯缺口。');
add('contradiction','反證法','logic',5,'technique','高中',['converse_inverse','direct_proof'],['反證法','矛盾'],'假設結論不成立，推導與已知、定義或邏輯相矛盾。','以反證法說明 √2 是無理數。');
add('invariants','不變量與奇偶策略','logic',5,'concept','競賽',['patterns','counterexample'],['不變量','奇偶'],'在反覆操作中尋找不變性或單調量，用來證明不可能或必然。','分析翻牌遊戲中黑面數量的奇偶性。');
add('induction','數學歸納法','logic',6,'technique','高中',['direct_proof','sequences'],['歸納法','遞推'],'完成基礎步驟、歸納假設與遞推步驟，證明所有自然數情況。','證明 1+2+…+n=n(n+1)/2。');
add('logic_boss','推理與證明整合挑戰','logic',7,'boss','競賽',['proof_structure','contradiction','induction','invariants'],['整合','Boss'],'依命題結構選擇直接證明、逆否、反證、歸納、不變量或反例。','為一個數論或組合命題寫出完整證明。');
// 建模
add('problem_parse','問題拆解與資訊篩選','modeling',0,'core','國中',['number_sense'],['已知','未知'],'把長篇題目分成已知、未知、限制與目標，剔除干擾資訊。','從生活情境中標記必要與非必要資料。');
add('representation','文字、表格、圖像與式子轉換','modeling',1,'core','國中',['problem_parse','variables'],['表徵','轉換'],'在文字、表格、圖像、式子與實物之間切換，確認表示一致。','把票價問題同時表示成表格與方程式。');
add('assumptions','假設、簡化與限制','modeling',2,'concept','國中',['representation'],['假設','限制'],'說明模型忽略了什麼、假設何時合理，以及結果不能用在哪裡。','評估把人流視為固定平均速度是否合理。');
add('units_dimension','單位與量綱檢查','modeling',2,'technique','國中',['measure_units','representation'],['量綱','檢查'],'利用單位追蹤判斷公式與計算是否可能正確。','說明速度×時間為何必須得到距離。');
add('estimate_model','費米估算','modeling',3,'application','競賽',['estimation','assumptions'],['估算','數量級'],'把大型問題拆成可估量因素，用合理假設得到數量級答案。','估算全校一天使用多少張衛生紙。');
add('linear_modeling','線性模型','modeling',3,'application','國中',['linear_function','representation'],['線性','參數'],'辨識固定起始值與固定變化率，解釋斜率、截距與適用範圍。','建立手機月租加流量費模型。');
add('ratio_modeling','比例與尺度模型','modeling',3,'application','國中',['proportion','triangle_similarity','representation'],['尺度','相似'],'利用比例處理地圖、模型、配方與縮放，注意面積與體積倍率。','分析模型車 1:24 的面積與體積倍率。');
add('simulation','模擬與試算','modeling',4,'application','高中',['prob_basic','sequences','representation'],['模擬','隨機'],'用表格、程式或重複試驗探索難以直接計算的系統。','模擬擲骰子 10,000 次並比較理論機率。');
add('validation','模型驗證與極端值檢查','modeling',5,'core','高中',['assumptions','graph_interpret','counterexample'],['驗證','極端值'],'利用資料、單位、極端值、反例與殘差檢查模型。','檢查一個溫度模型在極端情況下是否仍合理。');
add('optimization','限制下的最佳化','modeling',5,'application','高中',['quadratic_function','linear_ineq','assumptions'],['最大最小','限制'],'定義目標函數與限制條件，檢查內部解、邊界與整數限制。','求固定周長下最大面積。');
add('sensitivity','敏感度與參數分析','modeling',6,'concept','高中',['function_model','validation'],['參數','情境分析'],'觀察輸入改變對輸出的影響，辨識最關鍵的不確定參數。','分析利率變動對總還款額的影響。');
add('decision','多準則決策','modeling',6,'application','高中',['expected_value','sensitivity'],['權重','決策'],'在成本、風險、時間與效益間設定透明權重並比較方案。','建立交通工具選擇的加權評分表。');
add('communication','數學論證與溝通','modeling',6,'application','高中',['proof_structure','validation'],['報告','解釋'],'用文字、圖表、公式與限制，向非專業者清楚說明結果與建議。','用一頁簡報說明模型、結論與限制。');
add('modeling_boss','真實問題建模挑戰','modeling',7,'boss','競賽',['estimate_model','linear_modeling','ratio_modeling','simulation','optimization','decision','communication'],['整合','Boss'],'完成問題定義、假設、建模、試算、驗證、決策與溝通的完整循環。','為校園交通、午餐或學習資源提出可驗證方案。');

const byId=Object.fromEntries(S.map(s=>[s.id,s]));
const storageKey='starfire_math_tree_v1';
let completed=new Set(JSON.parse(localStorage.getItem(storageKey)||'[]').filter(id=>byId[id]));
let currentBranch='number',currentSkill=null,searchHighlight=null;
const $=q=>document.querySelector(q);
const branchNav=$('#branchNav'),treeGrid=$('#treeGrid'),treeSurface=$('#treeSurface'),connections=$('#connections'),viewport=$('#treeViewport');
function save(){localStorage.setItem(storageKey,JSON.stringify([...completed]));}
function unlocked(skill){return skill.prereqs.length===0||skill.prereqs.every(id=>completed.has(id));}
function normalize(){let changed=true;while(changed){changed=false;[...completed].forEach(id=>{const s=byId[id];if(s&&s.prereqs.length&&!s.prereqs.every(p=>completed.has(p))){completed.delete(id);changed=true;}});}save();}
function descendants(id){return S.filter(s=>s.prereqs.includes(id));}
function gradeMatch(s){const v=$('#gradeFilter').value;return v==='all'||s.grade.includes(v);}
function stateName(s){return completed.has(s.id)?'已完成':unlocked(s)?'可學習':'需前置';}
function renderBranches(){branchNav.innerHTML='';Object.entries(BRANCHES).forEach(([id,b])=>{const skills=S.filter(s=>s.branch===id);const done=skills.filter(s=>completed.has(s.id)).length;const btn=document.createElement('button');btn.type='button';btn.style.setProperty('--branch-color',b.color);btn.className=id===currentBranch?'active':'';btn.innerHTML=`<b>${b.icon}</b><strong>${b.name}</strong><small>${done}/${skills.length} 已完成</small>`;btn.onclick=()=>{currentBranch=id;searchHighlight=null;renderAll();viewport.scrollTo({left:0,top:0,behavior:'smooth'});};branchNav.append(btn);});$('#branchSummary').textContent=BRANCHES[currentBranch].summary;}
function renderTree(){const skills=S.filter(s=>s.branch===currentBranch&&gradeMatch(s));const max=Math.max(0,...skills.map(s=>s.level));treeGrid.style.setProperty('--level-count',max+1);treeGrid.innerHTML='';for(let level=0;level<=max;level++){const col=document.createElement('div');col.className='level-column';col.innerHTML=`<span class="level-label">LEVEL ${String(level+1).padStart(2,'0')}</span>`;skills.filter(s=>s.level===level).forEach(s=>{const btn=document.createElement('button');btn.type='button';const state=completed.has(s.id)?'complete':unlocked(s)?'open':'locked';btn.className=`skill-node ${state}${searchHighlight===s.id?' highlight':''}`;btn.dataset.id=s.id;btn.style.setProperty('--branch-color',BRANCHES[s.branch].color);btn.style.setProperty('--branch-color-fade',BRANCHES[s.branch].color+'33');btn.innerHTML=`<div class="node-top"><span class="node-glyph">${TYPE_ICON[s.type]}</span><span class="node-state">${stateName(s)}</span></div><h3>${s.title}</h3><p>${s.grade} · 難度 ${'◆'.repeat(s.type==='boss'?5:Math.min(5,Math.max(1,s.level/2+1)))}</p><div class="node-tags">${s.tags.slice(0,2).map(t=>`<span>${t}</span>`).join('')}</div><span class="node-lock">${state==='complete'?'✓':state==='open'?'可解鎖':'🔒'}</span>`;btn.onclick=()=>openSkill(s.id);col.append(btn);});treeGrid.append(col);}requestAnimationFrame(drawConnections);}
function drawConnections(){const surfaceRect=treeSurface.getBoundingClientRect();connections.setAttribute('width',treeSurface.scrollWidth);connections.setAttribute('height',treeSurface.scrollHeight);connections.setAttribute('viewBox',`0 0 ${treeSurface.scrollWidth} ${treeSurface.scrollHeight}`);connections.innerHTML='';S.filter(s=>s.branch===currentBranch&&gradeMatch(s)).forEach(s=>{const target=treeGrid.querySelector(`[data-id="${s.id}"]`);if(!target)return;s.prereqs.forEach(pid=>{const p=byId[pid];if(!p||p.branch!==currentBranch)return;const source=treeGrid.querySelector(`[data-id="${pid}"]`);if(!source)return;const a=source.getBoundingClientRect(),b=target.getBoundingClientRect();const x1=a.right-surfaceRect.left,y1=a.top+a.height/2-surfaceRect.top,x2=b.left-surfaceRect.left,y2=b.top+b.height/2-surfaceRect.top;const mid=x1+(x2-x1)*.5;const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',`M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`);path.setAttribute('class',`connection ${completed.has(pid)&&completed.has(s.id)?'complete':completed.has(pid)?'active':''}`);path.style.setProperty('--branch-color',BRANCHES[currentBranch].color);connections.append(path);});});}
function renderStats(){const all=S.length,done=completed.size,open=S.filter(s=>unlocked(s)&&!completed.has(s.id)).length,branch=S.filter(s=>s.branch===currentBranch),branchDone=branch.filter(s=>completed.has(s.id)).length,pct=Math.round(done/all*100),bpct=Math.round(branchDone/branch.length*100);$('#doneCount').textContent=done;$('#openCount').textContent=open;$('#totalCount').textContent=all;$('#heroProgress').textContent=pct+'%';$('#branchProgress').textContent=bpct+'%';}
function renderAll(){renderBranches();renderTree();renderStats();}
function chip(skill){if(!skill)return '<span>未收錄</span>';return `<button type="button" data-jump="${skill.id}">${skill.title}</button>`;}
function openSkill(id){const s=byId[id];if(!s)return;currentSkill=s;const b=BRANCHES[s.branch],isOpen=unlocked(s),isDone=completed.has(id);$('#skillDialog').style.setProperty('--dialog-color',b.color);$('#dialogIcon').textContent=TYPE_ICON[s.type];$('#dialogMeta').textContent=`${b.name} · ${TYPE_NAME[s.type]} · ${s.grade}`;$('#dialogTitle').textContent=s.title;$('#dialogDesc').textContent=s.desc;$('#masteryList').innerHTML=s.mastery.map(x=>`<li>${x}</li>`).join('');$('#errorList').innerHTML=s.errors.map(x=>`<li>${x}</li>`).join('');$('#prereqList').innerHTML=s.prereqs.length?s.prereqs.map(id=>chip(byId[id])).join(''):'<span>起始節點，不需要前置能力</span>';const next=descendants(id);$('#unlockList').innerHTML=next.length?next.map(chip).join(''):'<span>此節點位於目前路線終點</span>';$('#exampleText').textContent=s.example;const btn=$('#completeBtn');btn.disabled=!isOpen;btn.textContent=isDone?'取消完成':'標記為已完成';$('#lockMessage').textContent=isDone?'取消後，依賴此能力的後續完成紀錄也會被重新鎖定。':isOpen?'完成後將自動開啟後續節點。':`尚缺少：${s.prereqs.filter(p=>!completed.has(p)).map(p=>byId[p].title).join('、')}`;btn.onclick=()=>{if(!unlocked(s))return;if(completed.has(id)){completed.delete(id);normalize();}else{completed.add(id);save();}openSkill(id);renderAll();};$('#skillDialog').showModal();}
$('#skillDialog').addEventListener('click',e=>{const jump=e.target.closest('[data-jump]');if(jump){const id=jump.dataset.jump;currentBranch=byId[id].branch;searchHighlight=id;$('#skillDialog').close();renderAll();setTimeout(()=>{treeGrid.querySelector(`[data-id="${id}"]`)?.scrollIntoView({behavior:'smooth',block:'center',inline:'center'});openSkill(id);},250);}});
$('#searchInput').addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();if(!q){searchHighlight=null;renderTree();return;}const hit=S.find(s=>(s.title+s.tags.join('')+s.desc).toLowerCase().includes(q));if(hit){currentBranch=hit.branch;searchHighlight=hit.id;renderAll();setTimeout(()=>treeGrid.querySelector(`[data-id="${hit.id}"]`)?.scrollIntoView({behavior:'smooth',block:'center',inline:'center'}),120);}});
$('#gradeFilter').onchange=()=>renderTree();
$('#centerTree').onclick=()=>viewport.scrollTo({left:0,top:0,behavior:'smooth'});
$('#resetBtn').onclick=()=>{if(confirm('確定清除目前瀏覽器中的所有技能樹進度？')){completed.clear();save();renderAll();}};
$('#exportBtn').onclick=()=>{const data={version:1,project:'starfire-math-tree',exportedAt:new Date().toISOString(),completed:[...completed],mastery:{}};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download='星火計畫_數學技能樹進度.json';a.click();URL.revokeObjectURL(a.href);};
$('#importBtn').onclick=()=>$('#importFile').click();
$('#importFile').onchange=async e=>{try{const data=JSON.parse(await e.target.files[0].text());if(!Array.isArray(data.completed))throw new Error();completed=new Set(data.completed.filter(id=>byId[id]));normalize();renderAll();alert('進度匯入完成。');}catch{alert('檔案格式不正確。');}e.target.value='';};
window.addEventListener('resize',()=>requestAnimationFrame(drawConnections));new ResizeObserver(()=>requestAnimationFrame(drawConnections)).observe(treeGrid);
normalize();renderAll();