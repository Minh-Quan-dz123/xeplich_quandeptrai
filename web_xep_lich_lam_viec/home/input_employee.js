// khi người dùng nhập xong số lượng nhân viên
// b1: lấy giá trị người dùng nhập
// b2: tạo các input tương ứng với số lượng và nút button (xác nhận)
// b3: thêm các input vào giao diện gồm
// - input tên nhân viên
// - hỏi user là nhập thông tin ca làm việc được hay không làm việc được (1 trong 2)
// - input các ca làm việc được (sáng/ chiều/ tối) từ thứ 2 -> chủ nhật
// - nếu không nhập các ca làm việc việc thì nhập các ca không làm việc được
// - xong rồi thì lấy dữ liệu và lưu vào cơ sở dữ liệu
// b4: cho phép nút xác nhận được bấm để tạo bảng sau khi nhập xong tất cả thông tin (đến bước tiếp theo)
const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
const shifts = ["Sáng", "Chiều", "Tối", "Cả ngày"];
let number_of_employees = 1; // biến toàn cầu để lưu số lượng nhân viên
var max_employees_old = 0;

// function 1
function addEmployeeInputs() // bấm continue
{
    // B1: lấy giá trị người dùng nhập
    let max_employees_new = parseInt(document.getElementById("input_number_employee_id").value);

    // kiểm tra hợp lệ
    if(max_employees_new <= 1 || isNaN(max_employees_new))
    {
        alert("Vui lòng nhập số lượng nhân viên hợp lệ");
        return;
    }

    // B2: tạo các input tương ứng với số lượng và nút button (xác nhận)
    // nếu new_div tạo rồi thì thôi
    var new_div = document.getElementById("employee_inputs_div_id");
    if(!new_div) // nếu chưa có thì tạo mới
    {
        new_div = document.createElement("div");
        new_div.id = "employee_inputs_div_id";
        max_employees_old = max_employees_new;
    }
    else // kiểm tra xem người ta có thay đổi input số lượng nhân viên ko
    {
        if(max_employees_new != max_employees_old)// có thay đổi
        {
            new_div.innerHTML = "";// xóa hết nội dung và làm lại
            max_employees_old = max_employees_new;
            number_of_employees = 1;
        }
        // nếu ko có gì thay đổi
        else return;
    }

    // tạo H3
    const new_H3 = document.createElement("h3");
    new_H3.innerText = " Nhập tên và các ca nhân viên có thể làm hoặc nghỉ";
    new_div.appendChild(new_H3);

    // tạo button confirm
    const button_confirm = document.createElement("button");
    button_confirm.id = "button_confirm_id";
    button_confirm.className = "button_confirm_class";
    button_confirm.innerText = "Confirm";
    checkConfirm(button_confirm);
    new_div.appendChild(button_confirm);

    // tạo bảng
    create_table_for_employee(new_div, button_confirm, number_of_employees)
    
    // 3: thêm sự kiện click cho button confirm thì kiểm tra tất cả và gửi dữ liệu 
    button_confirm.addEventListener("click", () => {
        //3.1 kiểm tra tất cả nhân viên nhập hết ca làm việc của mình chưa
        if(number_of_employees == max_employees_old)
        {
            let tiep_tuc = confirm("Bạn có chắc muốn xác nhận không?");
            if(tiep_tuc) // nếu có thì kiểm tra ngày tháng và lưu trữ
            {
                const month1 = document.getElementById("input_month_id").value;
                const year1 = document.getElementById("input_year_id").value;
                // 3.2 kiểm tra và lưu trữ tháng, năm và chuyển giao diện
                if(store_month_year(month1,year1))// nếu ko lỗi thì gọi hàm lưu trữ ca làm việc
                {
                    //3.3 kiểm tra đã nhập đủ tên chưa
                    if(!check_names()) return;

                    //3.4 kiểm tra canwork
                    if(!check_canwork()) return;

                    //3.5 kiểm tra xem lịch nào không có ai làm
                    if(!check_empty()) return;

                    // 3.6 lưu dữ liệu về ca làm
                    set_data_shifts();

                    // 3.7 lưu số lượng nhân viên
                    localStorage.setItem("numberOfEmployees",max_employees_old);

                    // chuyển sang giao diện mới
                    window.location.href = "../schedule_interface/schedule.html";
                    //alert("oke");
                }
                else return;
            }
        }
        else {
            button_confirm.disabled = true; // tắt lại
            alert("Vui lòng nhập đủ ca cho tất cả nhân viên");
        }
    });
    document.body.appendChild(new_div);
}


// function 2
function create_table_for_employee(new_div, button_confirm, nv_ht)// bấm button confirm
{
    // 0: kiểm tra và tạo div
    let input_work = document.getElementById("input_work_id"+nv_ht);
    if(input_work)// nếu đã có rồi thì xóa dữ liệu cũ đi (dữ liệu cũ là các lựa chọn đã chọn trước đó)
    {
        input_work.innerHTML = "";
    }
    else // nếu chưa có thì tạo mới
    {
        input_work = document.createElement("div");
        input_work.id = "input_work_id"+nv_ht;
        input_work.className = "input_work_class";
    }

    // 1 tạo input tên nhân viên và lựa chọn ca làm việc
    //1.0 tạo parent chứa 2 thanh input
    const parent_input2 = document.createElement("div");// tạo parent chứa
    parent_input2.className = "parent_input2";

    // 1.1 tạo input tên 
    const new_input_name = document.createElement("input");
    new_input_name.type = "text";
    new_input_name.className = "input_employee_name";
    new_input_name.id = "input_employee_name_id"+nv_ht;
    new_input_name.placeholder = "Enter employee name";

    parent_input2.appendChild(document.createElement("br")); // thêm xuống dòng
    parent_input2.appendChild(new_input_name); // thêm input tên vào div chứa
    parent_input2.appendChild(document.createElement("br")); // thêm xuống dòng

    // 1.2 tạo lựa chọn
    const optionSelect = document.createElement("select");
    optionSelect.add(new Option("Chưa chọn gì", ""));
    optionSelect.add(new Option("Ca làm việc được", "can_work"));
    optionSelect.add(new Option("Ca không làm việc được", "cannot_work"));
    optionSelect.id = "Select" + nv_ht;

    parent_input2.appendChild(optionSelect); // thêm lựa chọn vào div chứa
    parent_input2.appendChild(document.createElement("br")); // thêm xuống dòng
    input_work.appendChild(parent_input2);

    // 2: tạo bảng
    const table = document.createElement("table");
    table.className = "table_class";
    table.id = "table_id"+nv_ht;

    // làm việc với table có tr là hàng, th là tiêu đề, td là ô, ko có cột
    // 2.0: tạo hàng đầu tiên để chứa các tiêu đề<tr></tr>
    const headerRow = document.createElement("tr"); 

    // 2.1: tạo ô tiêu đề thứ trong tuần
    const dayHeader = document.createElement("th"); // tạo ô <th></th>
    dayHeader.innerHTML = "Thứ";
    dayHeader.className = "column1";
    headerRow.appendChild(dayHeader); // thêm ô vào hàng đầu tiên

    // 2.2: tạo các ô tiêu đề ca làm việc
    const shiftHeader = document.createElement("th");
    shiftHeader.innerHTML = "Ca làm việc";
    headerRow.appendChild(shiftHeader);

    table.appendChild(headerRow); // thêm hàng đầu tiên vào bảng

    // duyệt để tạo các hàng cho từng ngày trong tuần
    for(let i = 0; i < days.length; i++)
    {
        // thêm hàng (row) mới vào cột thứ
        const row = document.createElement("tr"); // tạo hàng (ngang) mới
        const name_row = document.createElement("td"); // tạo 1 ô mới để tên
        name_row.innerHTML = days[i]; // gán tên ngày vào ô
        name_row.className = "column1";

        // thêm ô mới vào cột ca làm việc
        const shiftCell = document.createElement("td");// ô tiếp vào row để chứa các lựa chọn
        const shiftSelect = document.createElement("div"); // tạo các lựa chọn để chọn ca làm việc
 
        for(let j = 0; j < shifts.length; j++) // tạo các option
        {
            const items = document.createElement("input");
            items.type = "checkbox";
            items.value = shifts[j];
            items.className = "checkbox_class";
            items.id = "items_id_"+nv_ht+"_"+i+"_"+j; // nhân viên + thứ mấy + ca

            const label = document.createElement("label");
            label.innerHTML = shifts[j];
            
            shiftSelect.appendChild(label); // thêm label vào div chứa
            shiftSelect.appendChild(items); // thêm checkbox vào div chứa
        }

        shiftCell.appendChild(shiftSelect); // thêm select vào ô
        row.appendChild(name_row); // thêm ô ngày vào hàng
        row.appendChild(shiftCell); // thêm ô lựa chọn vào hàng
        table.appendChild(row); // thêm hàng vào bảng
    }
    input_work.appendChild(table); // thêm bảng vào div chứa tất cả
     
    // 3 tạo button "+" để tiếp tục nhân viên tiếp theo
    // nếu number_of_employees đã đặt max (max_employees) thì ko tạo thêm 
    if(number_of_employees < max_employees_old)// chưa thì vẫn tạo dấu cộng
    {
        const addButton = document.createElement("button");
        addButton.className = "add_button_class";
        addButton.innerText = "+";
        addButton.addEventListener("click", () => {
            if(number_of_employees >= max_employees_old) return; // cho tất cả button + vô hiệu hóa
            number_of_employees++; // tăng số lượng nhân viên lên 1
            checkConfirm(button_confirm);// kiểm tra bật/ tắt confirm
            create_table_for_employee(new_div, button_confirm, number_of_employees); // tạo bảng cho nhân viên tiếp theo
        });
        input_work.appendChild(addButton); // thêm button + vào div chứa
    }
    

    new_div.insertBefore(input_work, button_confirm); // thêm div chứa bảng vào div lớn
}
// hàm phụ
function checkConfirm(button_confirm)
{
    button_confirm.disabled = (number_of_employees<max_employees_old);
}

// function 3: lưu trữ ngày tháng
function store_month_year(month1,year1)
{ 
    // nếu chưa nhập thì thông báo chưa nhập
    if((!month1) || (!year1))
    {
        alert("bạn chưa nhập đầy đủ tháng, năm");
        return false;
    }

    // nhập tháng, năm sai
    if(month1<1 || month1 >12 || year1 <2025 || year1>2030)
    {
        alert("tháng, năm bạn nhận không hợp lý")
        return false;
    }

    // nếu oke hết thì lưu tháng, năm vào Storage
    localStorage.setItem("month", month1);
    localStorage.setItem("year",year1);

    return true;
}

// 4 hàm lấy dữ liệu 
function set_data_shifts()
{
    let employees = []; // mảng các nhân viên lưu tên, làm hay ko làm và mảng ca làm việc trong tuần
    // duyệt nhân viên-> thứ -> ca
    for(let i = 1; i <= max_employees_old; i++)
    {
        let ten = document.getElementById("input_employee_name_id" + i).value;
        let select_work = document.getElementById("Select" + i).value;
        let select_ca = []; // tại mỗi nhân viên tạo 1 mảng ca làm việc trong tuần
        for(let thu = 0; thu < days.length; thu++)
        {
            let data_ca = 0;
            for(let ca = 0; ca < shifts.length; ca++) // lấy ra giá trị của check box
            {
                const items = document.getElementById("items_id_"+i+"_"+thu+"_"+ca);
                if(items && items.checked)// nếu được chọn thì lưu vào select_ca
                {
                    if(items.value == "Sáng")
                    {
                        data_ca += 1;
                    }
                    else if( items.value == "Chiều")
                    {
                        data_ca += 2;
                    }
                    else if( items.value == "Tối")
                    {
                        data_ca += 4;
                    }
                    else data_ca += 8;
                }
            }
            select_ca.push(data_ca);
        }
        let employee = {
            Stt: i,
            Name: ten,
            Select_work: select_work,
            Table: select_ca
        };
        employees.push(employee);// chèn vào nhóm các nhân viên
    }
    localStorage.setItem("employeesInfor", JSON.stringify(employees));
}

// 5 function kiểm tra lịch còn chống không
function check_empty()
{
    const x = shifts.length - 1;
    for(let i = 0; i < days.length; i++)
    {
        let Shifts_check = [];
        // xét lựa chọn cả ngày
        Shifts_check[x] = false;
        for(let nv = 1; nv <= max_employees_old; nv++)
        {
            let selectFullday = document.getElementById("items_id_"+nv+"_"+i+"_"+x).checked;
            let select_work = document.getElementById("Select" + nv);
            if(select_work.value == "can_work")
            {
                if(selectFullday)// nếu có nhân viên chọn thì xong 
                {
                    Shifts_check[x] = true;
                    break;
                }
            }
            // nếu là cannot_work thì ko kết luận được gì
        }

        // duyệt theo 3 ca
        if(!Shifts_check[x])
        {
             for(let j = 0; j < x; j++)
            {
                Shifts_check[j] = false;
                for(let nv = 1; nv <= max_employees_old; nv ++) // duyệt từng nhân viên
                {
                    let select_ca = document.getElementById("items_id_"+nv+"_"+i+"_"+j).checked;
                    let select_work = document.getElementById("Select" + nv);
                    if(select_work.value == "can_work")// nếu là can_work
                    {
                        if(select_ca) // nếu chọn
                        {
                            Shifts_check[j] = true;
                            break;
                        }
                    }
                    else // cannot_work
                    {
                        // riêng cái cannot_work thì cần chú ý nếu nó chọn cả ngày thì bỏ
                        let selectFullday = document.getElementById("items_id_"+nv+"_"+i+"_"+x).checked;
                        if(!selectFullday) // nếu ko chọn cả ngày thì mới xét tiếp
                        {
                            if(!select_ca) // nếu chọn
                            {
                                Shifts_check[j] = true;
                                break;
                            }
                        }
                        
                    }
                    
                }
                // nếu khi duyệt hết nhân viên là ca i,j vẫn false thì thôi
                if(!Shifts_check[j])
                {
                    alert(`Ngày ${days[i]} - Ca ${shifts[j]} không có ai làm`);
                    return false;
                }
            }
        }
    }
    return true;
}

// 6 kiểm tra đã nhập đủ tên chưa
function check_names()
{
    for(let i = 1; i<= max_employees_old; i++)
    {
        let name_i = document.getElementById("input_employee_name_id"+i).value;
        if(!(name_i.trim()))
        {
            alert(`nhân viên thứ ${i} chưa nhập tên`);
            return false;
        }
    }
    return true;
}

// 7 kiểm tra can_work
function check_canwork()
{
    for(let i = 1; i <= max_employees_old; i++)
    {
        let select_work = document.getElementById("Select" + i).value;
        if(select_work == "")
        {
            alert(`nhân viên thứ ${i} chưa lựa chọn tiêu chí "làm hay không làm"`);
            return false;
        }
    }
    return true;
}