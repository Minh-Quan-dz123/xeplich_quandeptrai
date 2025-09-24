// 1 lấy dữ liệu từ trong local
let month_current = parseInt(localStorage.getItem("month"));
let year_current = parseInt(localStorage.getItem("year"));
let number_of_employees = parseInt(localStorage.getItem("numberOfEmployees"));

let employees = JSON.parse(localStorage.getItem("employeesInfor"));// condition 1
let NameOfEmployee = [];
//----
if (employees && employees.length > 0) {
    for (let emp of employees) {
        console.log("Stt:", emp.Stt);
        console.log("Name:", emp.Name);
        console.log("Select_work:", emp.Select_work);
        console.log("Table:", emp.Table);
        console.log("-----------------"); // phân cách cho dễ nhìn
    }
} else {
    console.log("Không có dữ liệu nhân viên trong localStorage.");
}
// ----
// tính tên
NameOfEmployee[0] = "KO CÓ AI";
for(let q of employees) NameOfEmployee[parseInt(q.Stt)] = q.Name;

// 2 hiển thị tiêu về
let title_h3 = document.getElementById("h3_id");
title_h3.textContent = "Lịch làm việc của tháng " + month_current +" năm " + year_current;

// 3 tạo bảng
// 3.1 tính số ngày trong tháng
let numberOfday = new Date(year_current, month_current,0).getDate();

// 3.2 khai báo tất cả các biến
let N = numberOfday;
let M = number_of_employees;
let GeneralCondition = []; // thứ 2: 1,2,4,8 : (0(1 là làm, 0 là ko làm),  0, 1, 2, 4, 3, 5, 6, >=7) 
// 0: ko làm gì. 1: làm sáng. 2: làm chiều. 4: làm tối
// 3: làm sáng chiều. 5: làm sáng tối. 6 làm chiều tối
// >7: làm cả ngày
let PersonalCondition = new Map(); 
let NumberOfShift = [];
let Score = [];
// let employees ở trên
let thu_cua_ngay = [];// vấn đề về ngày và thứ
let Standardization_day = [];
let ShiftOfDay = [];

let vt_option = 0; // số lượng ô nhập condition personal đã được tạo

// tạo thêm cấu trúc dữ liệu bucket (array + set) để duyệt, thêm, xóa ca làm của nhân viên nhanh chóng
let bucket_employee = [];// dữ liệu đã được khởi tạo ở trên
let NumberOfShift_MIN = 0; // ca của nhân viên nào có có ca bé nhất hiện tại
let NumberOfShift_MAX = 0; // ca lớn nhất hiện tại

// lưu lịch và hiển thị
let numberOfTable = 0;// số lượng bảng hiện tại
let schedules = []; // mảng lưu các lịch hiện tại chưa hiển thị và lịch đang hiển thị
let displayed_Schedules = [];// các lịch đã hiển thị
let current_Schedule_Display_index = 0; // vị trí lịch hiện tại

// màu 
const Colors = [
    "#F08080",  // màu đỏ
    "#FFFACD", // vàng nhạt
    "#90EE90", // xanh lá nhạt
    "#ADD8E6", // xanh dương nhạt
    "#d7bfaaff", // cam nhạt
    "#E6E6FA", // tím nhạt
    "#efcb89ff", // nâu nhạt
    "#FFB6C1"  // hồng nhạt
];

const colorOfEmployees = [];
function setColor()
{
    colorOfEmployees[0] = Colors[0];
    let t_color = 1;
    for(let i = 1; i<= M; i++)
    {
        colorOfEmployees[i] = Colors[t_color];
        t_color++;
        if(t_color > 8) t_color = 0;
    }
}
setColor();


// 3.3 tạo ra số hàng tương ứng
let table_schedule = document.getElementById("table_id");
create_table(); // khi vừa vào web nó tạo 1 bảng sẵn 
function create_table(){
    for(let i = 1; i <= numberOfday; i++)
    {
        let row_i = document.createElement("tr");// tạo hàng và nhét 4 ô vào

        let index_day = document.createElement("td");// ngày thứ
        index_day.innerHTML = i;

        // các ca
        let shiftOfday1 = document.createElement("td");
        shiftOfday1.id = "shiftOfday1_id_"+i;
        shiftOfday1.innerHTML = "Sáng";

        let shiftOfday2 = document.createElement("td");
        shiftOfday2.innerHTML = "Chiều";
        shiftOfday2.id = "shiftOfday2_id_"+i;

        let shiftOfday3 = document.createElement("td");
        shiftOfday3.innerHTML = "Tối";
        shiftOfday3.id = "shiftOfday3_id_"+i;

        // gán vào cây
        row_i.appendChild(index_day);
        row_i.appendChild(shiftOfday1);
        row_i.appendChild(shiftOfday2);
        row_i.appendChild(shiftOfday3);
        table_schedule.appendChild(row_i);
    }

    // khi vừa mới vào, tạm thời tạo 1 bảng lịch tạm
    current_Schedule_Display_index = 0;
    inputDataStandardization();
    createTableWith_GeneralCondition(1, 0);
    createTableWith_GeneralCondition(1, 0);
    createTableWith_GeneralCondition(1, 0);// tạo 3 cái trong cơ sở dữ liệu
    displayTable();
}


// 4 hàm nghe thay đổi của checkbox thứ 3 trong giao diện điều kiện
function addConditionForEmployees(cbAddCondition) // Finished
{
    // nếu tích
    if(cbAddCondition.checked)
    {
        // kiểm tra tích đã tạo giao diện trước lần tích trước đó chưa
        let div_more_condition = document.createElement("div");
        div_more_condition.id = "div_more_condition_id";
        // thêm giao diện các lựa chọn cho từng nhân viên
        // 1 tạo thêm div chứa
        
        // chèn vào cây DOM
        const div_div_condition_id = document.getElementById("div_div_condition_id");
        div_div_condition_id.appendChild(div_more_condition);

        // 2 tạo tiêu đề
        const title = document.createElement("h3");
        title.innerHTML = "Bấm dấu '+' để thêm cho mỗi nhân viên";
        div_more_condition.appendChild(title);

        // 3 tạo lựa chọn 
        // 3.1 thêm button +
        const button_add = document.createElement("button");
        button_add.id = "button_add_id";
        button_add.innerHTML = "+";
        div_more_condition.appendChild(button_add);

        // thêm nghe sự kiện
        button_add.addEventListener("click", ()=>{
            addOptionCondition(div_more_condition, button_add);
        });

        // 3.2 thêm thanh select và dấu xóa
        addOptionCondition(div_more_condition, button_add);

        // 3.3 thêm button xác nhận
        const button_confirm = document.createElement("button");
        button_confirm.id = "button_confirm_id";
        button_confirm.innerHTML = "confirm";
        div_more_condition.appendChild(button_confirm);
        button_confirm.addEventListener("click", () => {
            // kiểm tra user đã nhập đủ điều kiện riêng chưa
            if(!checkFullInputPersonalCondition()) return; 
            alert("hehe");
            // nếu rồi thì bắt đầu set table
            schedules = []; // làm mới
            displayed_Schedules = [];
            current_Schedule_Display_index = 0; // làm mới 
            numberOfTable = 0;
            setPersonalCondition(); // set điều kiện riêng
            for(let i = 0; i < 5; i++ ) createTableWith_GeneralCondition(1,0); // tạo 5 lần lịch riêng
            displayTable();
        });
    }
    else // nếu ko tích thì xóa giao diện "thêm" đó (nếu có)
    {
        let div_more_condition = document.getElementById("div_more_condition_id");
        if(div_more_condition)
        {
            vt_option=0;
            div_more_condition.remove();// xóa giao diện, xóa cả dữ liệu nữa
            schedules = []; // làm mới
            displayed_Schedules = [];
            current_Schedule_Display_index = 0; // làm mới 
            numberOfTable = 0;
            PersonalCondition = new Map();  // làm mới điều kiện riêng

            // xét lại lịch
            createTableWith_GeneralCondition(1,0);
            createTableWith_GeneralCondition(1,0);
            createTableWith_GeneralCondition(1,0);
            displayTable();
        }
    }
}

// 5 hàm phụ tạo các option cho các nhân viên
function addOptionCondition(div_more_condition, button_add)
{
    vt_option++;
    const div_chua = document.createElement("div");
    div_chua.id = "div_chua_id_"+vt_option;
    div_more_condition.insertBefore(div_chua,button_add);// chèn vào div_more_condition -> (div_chua, button)

    // 1 tạo thanh lựa chọn
    const select_employees = document.createElement("select");
    select_employees.id = "select_employees_id_"+vt_option;
    div_chua.appendChild(select_employees); // div_chua ->(select_employees);

    // chèn option vào
    select_employees.add(new Option("chọn nhân viên",""));
    for(let i = 0; i<number_of_employees; i++)
    {
        const select_item = new Option(employees[i].Name,employees[i].Stt);
        select_employees.add(select_item);
    }
    // 2 tạo sự kiện nghe chọn nhân viên
    let stt = vt_option;
    select_employees.addEventListener("change", (e) => {
        // 2.1 hiện thêm các lựa chọn
        // ví dụ ngày 21, làm được ca/ không làm được ca: sáng chiều tối
        create_more_condition_employee(stt); // tạo giao diện
    });

    // 3 tạo dấu xóa
    const button_delete = document.createElement("button");
    button_delete.id = "button_delete_id_"+vt_option;
    button_delete.innerHTML = "🗑️";

    div_chua.appendChild(button_delete); // div_chua ->(select_employees, button_delete)
    div_chua.appendChild(document.createElement("br"));

    button_delete.addEventListener("click", ()=>{
        // gọi tới hàm xóa contidion riêng
        delete_div_more_condition(button_delete);
    });

}

// 6 thêm điều kiện riêng
function create_more_condition_employee(stt)
{
    delete_personal_condition(stt)// cứ thay đổi là xóa đi
    // tạo giao diện chọn 
    
    //  1 nếu user chọn lại "chọn nhân viên" thì return
    // ngược lại chọn nv khác thì về trạng thái ban đầu là thêm điều kiện
    const select_crr = document.getElementById("select_employees_id_"+stt);// lấy ra select đây lm việc
    const button_crr = document.getElementById("button_delete_id_"+stt)
    if(select_crr.value != "") // thì tại giao diện thêm condition mới
    {
        // 1.1 tạo div chứa và gắn vào cây: div_chua -> (select_employees, button_delete,br, div_personal_condition)
        const div_personal_condition = document.createElement("div");
        div_personal_condition.id = "div_personal_condition_id"+stt;
        button_crr.parentNode.insertBefore(div_personal_condition,button_crr.nextSibling);

        // 1.3 tạo input day vào
        const inputDate = document.createElement("input");
        inputDate.type = "number";
        inputDate.id = "inputDate_id_"+stt;
        inputDate.min = 1;
        inputDate.max = numberOfday;
        inputDate.placeholder = "nhập ngày (1 - "+numberOfday+" )";
        div_personal_condition.appendChild(inputDate);


        // 1.4 tạo lựa chọn sau khi nhập input 
        // - chỉ làm được các ca...
        const label_nv = document.createElement("label");
        label_nv.innerHTML = " ko làm được ca: "
        div_personal_condition.appendChild(label_nv);


        const label_sang = document.createElement("label");
        label_sang.innerHTML = "Sáng ";

        const checkbox_shift_sang = document.createElement("input");
        checkbox_shift_sang.type = "checkbox";
        checkbox_shift_sang.id = "checkbox_shift_sang_id_"+stt;
        div_personal_condition.appendChild(label_sang);
        div_personal_condition.appendChild(checkbox_shift_sang);


        const label_chieu = document.createElement("label");
        label_chieu.innerHTML = "chiều ";

        const checkbox_shift_chieu = document.createElement("input");
        checkbox_shift_chieu.type = "checkbox";
        checkbox_shift_chieu.id = "checkbox_shift_chieu_id_"+stt;
        div_personal_condition.appendChild(label_chieu);
        div_personal_condition.appendChild(checkbox_shift_chieu);


        const label_toi = document.createElement("label");
        label_toi.innerHTML = "tối ";

        const checkbox_shift_toi = document.createElement("input");
        checkbox_shift_toi.type = "checkbox";
        checkbox_shift_toi.id = "checkbox_shift_toi_id_"+stt;
        div_personal_condition.appendChild(label_toi);
        div_personal_condition.appendChild(checkbox_shift_toi);
        div_personal_condition.appendChild(document.createElement("br"));

    }

}
// 6.5 delete_personal_condition
function delete_personal_condition(stt)
{  
    //  xóa giao diện các lựa chọn 
    let div_stt = document.getElementById("div_personal_condition_id"+stt);
    if(div_stt) div_stt.remove();
}


// 7 hàm xóa giao diện div_chua
function delete_div_more_condition(button_delete)
{

    //xóa giao diện: từ stt của phần nhập điều kiện riêng, ta xóa nó đi
    (button_delete.parentNode).remove();
}

//8 kiểm tra nhập đủ chưa
function checkFullInputPersonalCondition()
{
    // kiểm tra đã nhập đầy đủ chưa
    let tt = 0;
    for(let i = 1; i<= vt_option; i++)
    {
        let select_e = document.getElementById("select_employees_id_"+i);
        if(!select_e) continue; // nếu đã bị xóa trc đó thì sang cái tiếp
        else tt++;
        if(select_e.value == "")// chưa nhập tên
        {
            alert(`Bạn chưa nhập thông tin tại hàng thứ ${tt}`);
            return false;
        }
        
        let inputDate = document.getElementById("inputDate_id_"+i).value;
        if(inputDate < 1 || isNaN(inputDate))// xem đã nhập ngày chưa
        {
            alert(`Bạn chưa nhập ngày nào nghỉ (số thự tự: ${i})`);
            return false;
        }
    }
    return true;
}

// 9 hàm tạo lịch đã sắp xếp theo lịch mặc định
/*cụ thể bài toán cấp độ 2 như sau, trong 1 tháng có  N ngày, mỗi ngày 3 ca, sáng, chiều, tối. 
có M nhân viên, mỗi nhân viên trước đó đã chọn ra các ca làm việc trong tuần (ví dụ thứ 2 làm sáng chiều, thứ 4 làm tối,..) 
gọi là "điều kiện chung của nhân viên đó"- nghĩa là các tuần trong tháng đó nhân viên đều làm các ca như vậy, bên cạnh đó còn 
có "điều kiện riêng" - là 1 hoặc 1 vài ngày trong tháng đó nhân viên nghỉ đột xuất không cần biết có lịch làm hay không. 
Ta cần sắp xếp M nhân viên cho 1 tháng N này đó sao cho thỏa mãn về điều kiện chung GereralCondition[i] và 
điều kiện riêng PersonalCondition[i]. 1 cách sắp xếp sẽ có điểm 
Score = - (tổng của (số ca của nhân viên i - trung bình tổng số ca của mỗi nhân viên)), 
ý nghĩa là số lượng ca của các nhân viên là gần bằng nhau nhất, ví dụ M = 4 thì (23,23,24,24) sẽ tốt hơn (23,23,23,25). 
Score lớn nhất (về mặt giá trị) sẽ là điểm ưu tiên cao nhất. 
Kết quả cần hiển thị giao diện của các lịch được sắp xếp theo điểm ưu tiên từ cao -> thấp (tốt -> không tốt)*/
// input:
// M = number_of_employees
// N = numberOfday
// điều kiện
// AverageShift
// GeneralCondition[] (2, thứ 2->chủ nhật: ca) => mảng 2 chiều
// PersonalCondition[] (2, ngày.. -> ca) => mảng 2 chiều

// output
// NumberOfShift[]
// Score[]
// => hiển thị


// 9.0 hàm set điều kiện riêng
function setPersonalCondition()
{
    PersonalCondition = new Map(); 
    for(let i = 1; i <= vt_option; i++) // duyệt theo vt_option (select-delete - ngày: sáng chiều tối) cùng stt
    {
        const nv = document.getElementById("select_employees_id_"+i); // chứa Name/Stt
        if(nv)// nếu tồn tại thì lấy ( ko thì tức là đã bị xóa)
        {
            const nv_value = parseInt(nv.value);
            // lấy ngày
            const day = document.getElementById("inputDate_id_"+i); // ngày

            // không làm được ca
            const ca_sang = document.getElementById("checkbox_shift_sang_id_"+i);
            const ca_chieu = document.getElementById("checkbox_shift_chieu_id_"+i);
            const ca_toi = document.getElementById("checkbox_shift_toi_id_"+i);

            let data_ca = 0;
            if(ca_sang.checked)
            {
                data_ca += 1;
            }
            if(ca_chieu.checked)
            {
                data_ca += 2;
            }
            if(ca_toi.checked)
            {
                data_ca += 4;
            }
            // thêm dữ liệu
            // nếu nv này chưa có thì khai báo
            if(!PersonalCondition.has(nv_value)) // map(key,value) = map(nv, map()) (map trong là danh sách điều kiện riêng)
            {                              // = map(nv, map(day, data_ca))
                PersonalCondition.set(nv_value,new Map());
            }
            // có nv rồi nhưng chưa có ngày này thì phải khai báo tiếp
            let MapOfNv = PersonalCondition.get(nv_value);
            MapOfNv.set(parseInt(day.value),data_ca);
        }
    }
}

// 9.1 hàm chuẩn hóa đầu vào và khởi tạo lại các biến
function inputDataStandardization()
{
    //1 tính GeneralCondition
    for(let i = 1; i <= M; i++)// duyệt danh sách nhân viên
    {
        // 1.1 GeneralCondition
        GeneralCondition[i] = [];
        //1.1 làm hay ko làm
        if(employees[i-1].Select_work == "can_work")
        {
            GeneralCondition[i].push(1);
        }
        else GeneralCondition[i].push(0);

        // 1.2 chèn lựa chọn
        for(let j = 0; j < 7; j++)
        {
            // chèn thứ 0 -> thứ 2, 1-> thứ 3,.. 6 -> chủ nhật
            GeneralCondition[i].push(employees[i-1].Table[j]); // mảng 1 chiều lưu giá trị lựa chọn để ánh xạ
        }
    }

    // 2 tính PersonalCondition
    setPersonalCondition();

    // 3 tạo khởi đầu của số ca của mỗi nhân viên hiện tại
    for(let i = 1; i <= M; i++) NumberOfShift[i] = 0;

    // 4 tính thứ của ngày bất kì trong tháng
    Standardization_day[0] = 6;
    Standardization_day[1] = 0;
    Standardization_day[2] = 1;
    Standardization_day[3] = 2;
    Standardization_day[4] = 3;
    Standardization_day[5] = 4;
    Standardization_day[6] = 5;
    for(let i = 1; i <= N; i++)
    {
        thu_cua_ngay[i] = Standardization_day[new Date(year_current, month_current - 1, i).getDay()];
        // ánh xạ lại theo của ta: 0 = chủ nhật (1->6) ->(thứ 2 -> chủ nhật)
    }

    // 5 khởi tạo các ca thành 0
    for(let i = 1; i <= N; i++)
    {
        ShiftOfDay[i] = [0,0,0]; // 3 ca sáng chiều tối chưa ai nhận
    }

    // 6 khởi tạo cấu trúc dữ liệu để lấy ra nhân viên có số ca bé nhất hiện tại
    bucket_employee = [];
    for(let i = 0; i < 60; i++) bucket_employee.push(new Set());
   
    // hiện tại của M nhân viên đều chưa có ca
    for(let i = 1; i<= M; i++) bucket_employee[0].add(i);
    
}

// 9.2 hàm check điều kiện
// personalcondition = map(nv, map(day,ca))
function check_personal_condition(nv, day, shift)// check điều kiện 2 (chứa những ngày nv này ko đi làm được)
{
    // nếu  nv này ko có điều kiện riêng thì oke lun
    if(day == 1) console.log(`xét nhân viên ${nv}`);
    if(!PersonalCondition.has(nv)) 
    {
        console.log(`ko có nhân viên ${nv}`);
        return true;
    }

    console.log(`có nhân viên ${nv}`);
    // nếu nv này có điều kiện riêng vào ngày day thì oke tiếp tục
    // nếu ko có ở ngày day thì oke lun 
    if(!PersonalCondition.get(nv).has(day)) return true;
    else console.log(` nhân viên ${nv} có p vào ngày ${day}`);

    const x = PersonalCondition.get(nv).get(day);
    console.log(`x = ${x}`);
    if(shift == 0) // ca 1
    {
        // ko đi làm được vào những ca sau
        if(x == 1 || x == 3 || x == 5 || x >= 7) return false;
    }
    else if(shift == 1) // ca 2
    {
        if(x == 2 || x == 3 || x >= 6) return false;
    }
    else if(shift == 2) // ca 4
    {
        if(x >= 4) return false;
    }
    return true;
}
function check_condition(nv, day, shift) //shift = 0 => 1. 1 =>2.  2=> 4
{
    // 1. check xem nhân viên này có làm hết cả ngày không
    if(shift == 2)
    {
        if(ShiftOfDay[day][1] == nv && ShiftOfDay[day][0] == nv)
        {
            return false;
        }
    }
    // làm được ca 1: x phải bằng 1,3,5>=7
    // làm được ca 2: x phải bằng 2,3,6,>=7
    // làm được ca 4: x phải bằng 4,5,6, >=7
    // 2. check điều kiện chung: nhân viên vào 
    const thu = thu_cua_ngay[day]; // thứ 2 => 0, thứ 3 => 1... 6=> chủ nhật
    if(GeneralCondition[nv][0] == 1) // có làm
    {
        const x = GeneralCondition[nv][thu + 1];
        if(shift == 0) // ca 1
        {
            // nếu qua điều kiện 1 thì tiếp là xem có qua điều kiện 2 không
            if(x == 1 || x == 3 || x == 5 || x >= 7) return check_personal_condition(nv,day,shift);
        }
        else if(shift == 1) // ca 2
        {
            if(x == 2 || x == 3 || x >= 6) return check_personal_condition(nv,day,shift);
        }
        else if(shift == 2) // ca 4
        {
            if(x >= 4) return check_personal_condition(nv,day,shift);
        }
        // nếu ko làm đc thì false
        return false;
    }
    else// bằng 0, chọn là "ca ko làm được"
    {
        const x = GeneralCondition[nv][thu + 1];
        if(shift == 0) // ca 1
        {
            if(x == 1 || x == 3 || x == 5 || x >= 7) return false;
        }
        else if(shift == 1) // ca 2
        {
            if(x == 2 || x == 3 || x >= 6) return false;
        }
        else if(shift == 2) // ca 4
        {
            if(x >= 4) return false;
        }

        // nếu ko bị dính ca thì tức là làm được
        return check_personal_condition(nv,day,shift);
    }
}

// hàm tạo vào duyệt
function updateShift(nv)// hàm tăng số ca của nhân viên lên 1 đơn vị
{
    bucket_employee[NumberOfShift[nv]].delete(nv);// xóa ở nv index cũ
    NumberOfShift[nv]++;// tăng lên
    bucket_employee[NumberOfShift[nv]].add(nv);

    // cập nhật lại NumberOfShift_MIN và NumberOfShift_MAX
    NumberOfShift_MAX = Math.max(NumberOfShift[nv], NumberOfShift_MAX);
    if(bucket_employee[NumberOfShift_MIN].size == 0) NumberOfShift_MIN++; 
  
}

function reduceShift(nv) // hàm giảm số ca của nv
{
    bucket_employee[NumberOfShift[nv]].delete(nv);// xóa ở nv index cũ
    NumberOfShift[nv]--;// giảm xuống
    bucket_employee[NumberOfShift[nv]].add(nv); 
    
    // cập nhật lại NumberOfShift_MIN và NumberOfShift_MAX
    NumberOfShift_MIN = Math.min(NumberOfShift[nv], NumberOfShift_MIN);
    if(bucket_employee[NumberOfShift_MAX].size == 0) NumberOfShift_MAX--; 
}

function initialization()
{
    // 1 table
    for(let i = 1; i <= N; i++) ShiftOfDay[i] = [0,0,0];

    //2 bucket
    NumberOfShift_MIN = 0;
    NumberOfShift_MAX = 0;
    bucket_employee = [];

    for(let i = 0; i < 60; i++) bucket_employee.push(new Set());
   
    // hiện tại của M nhân viên đều chưa có ca
    for(let i = 1; i<= M; i++) bucket_employee[0].add(i);

    // số ca hiện tại 
    for(let i = 1; i <= M; i++) NumberOfShift[i] = 0;
}

function createTableWith_GeneralCondition(start_day, start_shift)
{
    // 0 khởi tạo lại 1 số biến
    initialization();
    // 1 chạy code duyệt từng ngày, mỗi ngày 1 ca (30*3* nhân viên)
    // lấy ra nv để xét
    for(let day = start_day; day <= N; day++)
    {
        for(let shift = start_shift; shift < 3; shift++) // tại mỗi ca 
        {
            console.log(`ngay ----- ${day}----ca----${shift}`);
            if(ShiftOfDay[day][shift] == 0) // chưa ai nhận thì duyệt
            {
                console.log("NumberOfShift_MIN2", NumberOfShift_MIN);
                console.log("NumberOfShift_MAX2", NumberOfShift_MAX);
                label_duyet:
                for(let index = NumberOfShift_MIN; index <= NumberOfShift_MAX; index++)
                {  
                    console.log("index", index);
                    // chọn nhân viên ngẫu nhiên
                        let candidates = [];
                        for(let nv of bucket_employee[index]) 
                        { 
                            if(check_condition(nv,day,shift))// nếu nv này thõa mãn 
                            { 
                                candidates.push(nv);
                            }
                        }
                        if(candidates.length > 0) // chọn ngẫu nhiên 1 người
                        {
                            let chosen_nv = candidates[Math.floor(Math.random() * candidates.length)];
                            updateShift(chosen_nv);
                            console.log("chosen_nv", chosen_nv); // in ra
                            ShiftOfDay[day][shift] = chosen_nv;
                            break label_duyet;
                        }
                }
            }
        }
    }
    let x = calculateScore();
    // chạy xong thì lưu
    let schedule = {
        table: JSON.parse(JSON.stringify(ShiftOfDay)), // kỹ thuật lưu bản sao, về sau khi ShiftOfDay thay đổi
        score: x                                       // thì table ko bị thay đổi
    }
    schedules.push(schedule);
    numberOfTable++;
}

// 10. tính điểm
function calculateScore()
{
    let result = 0;
    const AverageShift = (N*3)/M;
    for(let nv = 1; nv <= M; nv++)
    {
        result += - Math.abs(NumberOfShift[nv] - AverageShift);
    }
    return result;
}

// 11 hiển thị
function displayTable()
{
    if(displayed_Schedules.length == 0) // hiển thị lần đầu tiên
    {
        schedules.sort((a,b) => b.score - a.score); // viết hơi tắt: sắp xếp giảm dần
        displayed_Schedules.push(schedules[0].table); // chèn lịch tốt nhất hiện tại vào
        schedules.shift();// xóa lịch tốt nhất đó đi
        displayTable(); // gọi lại để chạy nhánh else
    }
    else
    {
        let h3_index = document.getElementById("h3_index_id");
        let h3_numberOfTable = document.getElementById("h3_numberOfTable_id");
        h3_index.innerHTML = current_Schedule_Display_index+1;
        h3_numberOfTable.innerHTML = numberOfTable;

        let table = displayed_Schedules[current_Schedule_Display_index]; // lịch hiển thị
        
        // hiển thị
        for(let day = 1; day <= N; day++)
        {
            let sang = document.getElementById("shiftOfday1_id_"+day);
            let chieu = document.getElementById("shiftOfday2_id_"+day);
            let toi = document.getElementById("shiftOfday3_id_"+day);

            sang.innerHTML = NameOfEmployee[table[day][0]];
            chieu.innerHTML = NameOfEmployee[table[day][1]];
            toi.innerHTML = NameOfEmployee[table[day][2]];

            //Colors_NV
            // chèn nhân viên mỗi nhân viên 1 màu
            sang.style.backgroundColor = colorOfEmployees[table[day][0]];
            chieu.style.backgroundColor = colorOfEmployees[table[day][1]];
            toi.style.backgroundColor = colorOfEmployees[table[day][2]];
            
        }
    }
}

// 12 cài đặt hàm cho nút next
function nextTable()
{
    // nếu đã đạt đến lịch cuối
    if(current_Schedule_Display_index >= numberOfTable - 1)
    {
        current_Schedule_Display_index = 0;
        displayTable();
    }
    else
    {
        // nếu đầu vẫn đang tạo lịch
        if(schedules.length != 0)
        {
            // hiển thị lịch tiếp theo
            current_Schedule_Display_index++;
            displayed_Schedules.push(schedules[0].table); // chèn lịch tốt nhất hiện tại vào
            schedules.shift();// xóa lịch tốt nhất đó đi
            displayTable();

            // tạo lịch mới
            // mỗi lần bấm next thì tạo ra 2 lịch nữa
            if(numberOfTable < 20) // qua 20,21 lịch thì thôi, còn chưa thì tạo tiếp
            {
                createTableWith_GeneralCondition(1,0);
                createTableWith_GeneralCondition(1,0);
                schedules.sort((a,b) => b.score - a.score); // viết hơi tắt: sắp xếp giảm dần                
            }
            let h3_numberOfTable = document.getElementById("h3_numberOfTable_id");
            h3_numberOfTable.innerHTML = numberOfTable;
        }
        else
        {
            current_Schedule_Display_index++;
            displayTable();
        }
    }

}
// 13 cài đặt nút before (xem lại lịch trước đó đã xem)
function beforeTable()
{
    if(current_Schedule_Display_index == 0) return;
    else 
    {
        current_Schedule_Display_index--; 
        displayTable();
    }
}






