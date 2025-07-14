document.addEventListener('DOMContentLoaded', () => {
    // --- KHAI BÁO CÁC PHẦN TỬ DOM CHÍNH ---
    const mainWrapper = document.querySelector('.main-wrapper');
    const navButtons = document.querySelectorAll('.nav-button');
    const contentSections = document.querySelectorAll('.content-section');

    // Nút menu
    const showSemesterListBtn = document.getElementById('show-semester-list');
    const showOverallGpaBtn = document.getElementById('show-overall-gpa');
    const showExpectedGpaBtn = document.getElementById('show-expected-gpa');
    const showScheduleBtn = document.getElementById('show-schedule-btn');
    const openLocalStorageViewerBtn = document.getElementById('open-localstorage-viewer-btn');

    // Phần Học kỳ
    const semesterListSection = document.getElementById('semester-list-section');
    const semestersContainer = document.getElementById('semesters-container');
    const addSemesterBtn = document.getElementById('add-semester-btn');

    // Phần GPA Tích lũy
    const overallGpaSection = document.getElementById('overall-gpa-section');
    const overallCumulativeGpa10Span = document.getElementById('overall-cumulative-gpa10');
    const overallCumulativeGpa4Span = document.getElementById('overall-cumulative-gpa4');
    const overallCumulativeCreditsSpan = document.getElementById('overall-cumulative-credits');

    // Phần GPA Kì vọng
    const expectedGpaSection = document.getElementById('expected-gpa-section');
    const currentCumulativeGpa4ExpectedInput = document.getElementById('currentCumulativeGpa4Expected');
    const currentCumulativeCreditsExpectedInput = document.getElementById('currentCumulativeCreditsExpected');
    const totalCreditsForGraduationInput = document.getElementById('totalCreditsForGraduation');
    const targetGpa4Input = document.getElementById('targetGpa4');
    const calculateExpectedGpaButton = document.getElementById('calculate-expected-gpa');
    const displayTargetGpaSpan = document.getElementById('display-target-gpa');
    const requiredGpaRemainingSpan = document.getElementById('required-gpa-remaining');
    const remainingCreditsSpan = document.getElementById('remaining-credits');
    const gap32Span = document.getElementById('gap-3-2');
    const gap30Span = document.getElementById('gap-3-0');
    const gap36Span = document.getElementById('gap-3-6');

    // Phần Thời khóa biểu
    const scheduleSection = document.getElementById('schedule-section'); 
    const scheduleInputTextarea = document.getElementById('schedule-input-textarea'); 
    const processScheduleDataBtn = document.getElementById('process-schedule-data-btn'); 
    const clearScheduleBtn = document.getElementById('clear-schedule-btn'); 
    const fullScheduleGrid = document.getElementById('full-schedule-grid');
    const scheduleFilterButtons = document.querySelectorAll('.schedule-filter-btn'); 
    const noScheduleMessageDiv = document.getElementById('no-schedule-message');


    // Dialog (Modal) tính điểm môn học
    const courseCalculatorDialog = document.getElementById('course-calculator-dialog');
    const closeCourseDialogButton = courseCalculatorDialog.querySelector('.close-button');
    const dialogSemesterNameH2 = document.getElementById('dialog-semester-name');
    const dialogCoursesContainer = document.getElementById('dialog-courses-container');
    const addCourseDialogBtn = document.getElementById('add-course-dialog');
    const calculateAndSaveCoursesBtn = document.getElementById('calculate-and-save-courses');
    const clearAllCoursesDialogBtn = document.getElementById('clear-all-courses-dialog');
    const dialogGpa10Span = document.getElementById('dialog-gpa10');
    const dialogGpa4Span = document.getElementById('dialog-gpa4');
    const dialogTotalCreditsSpan = document.getElementById('dialog-total-credits');

    // Dialog (Modal) Local Storage Viewer
    const localstorageViewerDialog = document.getElementById('localstorage-viewer-dialog');
    const closeLocalStorageViewerButton = localstorageViewerDialog.querySelector('.close-button'); // Fix: Sử dụng class close-button chung
    const localstorageJsonTextarea = document.getElementById('localstorage-json-textarea');
    const saveLocalstorageJsonBtn = document.getElementById('save-localstorage-json-btn');
    const closeLocalstorageViewerBtn = document.getElementById('close-localstorage-viewer-btn');


    // --- DỮ LIỆU ỨNG DỤNG TRUNG TÂM ---
    let appData = {
        semesters: [],
        currentSemesterId: null,
        nextSemesterIdCounter: 1,
        schedule: [],
    };

    let errorsFoundDuringCalc = [];


    // --- CÁC HÀM TIỆN ÍCH ---
    const convertScoreToLetterGrade = (score10) => {
        if (score10 >= 9.5) return 'A+';
        if (score10 >= 8.5) return 'A';
        if (score10 >= 8.0) return 'B+';
        if (score10 >= 7.0) return 'B';
        if (score10 >= 6.5) return 'C+';
        if (score10 >= 5.5) return 'C';
        if (score10 >= 5.0) return 'D+';
        if (score10 >= 4.0) return 1.0;
        return 'F';
    };

    const convertToGpa4 = (score10) => {
        if (score10 >= 8.5) return 4.0;
        if (score10 >= 8.0) return 3.5;
        if (score10 >= 7.0) return 3.0;
        if (score10 >= 6.5) return 2.5;
        if (score10 >= 5.5) return 2.0;
        if (score10 >= 5.0) return 1.5;
        if (score10 >= 4.0) return 1.0;
        return 0.0;
    };

    const calculateSubjectAverageScore = (assignmentScore, midtermScore, finalScore, weightAssignment, weightMidterm, weightFinal) => {
        let weightedSum = 0;
        let totalWeight = 0;

        if (!isNaN(assignmentScore) && assignmentScore >= 0 && assignmentScore <= 10 && !isNaN(weightAssignment) && weightAssignment > 0) {
            weightedSum += assignmentScore * weightAssignment;
            totalWeight += weightAssignment;
        }
        if (!isNaN(midtermScore) && midtermScore >= 0 && midtermScore <= 10 && !isNaN(weightMidterm) && weightMidterm > 0) {
            weightedSum += midtermScore * weightMidterm;
            totalWeight += weightMidterm;
        }
        if (!isNaN(finalScore) && finalScore >= 0 && finalScore <= 10 && !isNaN(weightFinal) && weightFinal > 0) {
            weightedSum += finalScore * weightFinal;
            totalWeight += weightFinal;
        }
        
        if (totalWeight === 0) {
            return 0; 
        }
        
        return weightedSum / totalWeight;
    };


    // --- HÀM QUẢN LÝ LOCAL STORAGE CHO appData ---
    const saveAppData = () => {
        localStorage.setItem('gpaManagementData', JSON.stringify(appData));
    };

    const loadAppData = () => {
        const storedData = localStorage.getItem('gpaManagementData');
        if (storedData) {
            try {
                appData = JSON.parse(storedData);
                let maxId = 0;
                appData.semesters.forEach(sem => {
                    if (parseInt(sem.id.replace('semester', '')) > maxId) {
                        maxId = parseInt(sem.id.replace('semester', ''));
                    }
                });
                appData.nextSemesterIdCounter = maxId + 1;
                // Đảm bảo appData.schedule tồn tại
                if (!appData.schedule) { 
                    appData.schedule = []; 
                }
            } catch (e) {
                console.error("Lỗi khi đọc dữ liệu từ Local Storage:", e);
                alert("Dữ liệu lưu trữ bị lỗi hoặc không hợp lệ. Đã tải lại ứng dụng với dữ liệu trống.");
                appData.semesters = [];
                appData.nextSemesterIdCounter = 1;
                appData.schedule = []; // Khởi tạo lại nếu lỗi
            }
        } else {
            appData.semesters = [];
            appData.nextSemesterIdCounter = 1;
            appData.schedule = []; // Khởi tạo nếu không có dữ liệu
        }
        if (appData.semesters.length === 0) {
            addSemester('Học kỳ 1 (Năm 1)', true); 
        }
    };


    // --- HÀM QUẢN LÝ GIAO DIỆN (CHUYỂN SECTION) ---
    const showSection = (sectionId) => {
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        navButtons.forEach(button => {
            button.classList.remove('active');
        });
        const correspondingNavButton = document.getElementById(`show-${sectionId.replace('-section', '')}`);
        if (correspondingNavButton) {
            correspondingNavButton.classList.add('active');
        }

        if (sectionId === 'expected-gpa-section') {
            updateExpectedGpaSection();
        }else if (sectionId === 'schedule-section') { 
            renderSchedule(); 
    };
}


    // --- HÀM QUẢN LÝ HỌC KỲ ---
    const addSemester = (name = null, setActive = false) => {
        const newSemesterId = `semester${appData.nextSemesterIdCounter++}`;
        const newSemester = {
            id: newSemesterId,
            name: name || `Học kỳ ${appData.nextSemesterIdCounter - 1}`, 
            courses: [], 
            semesterGpa10: 0,
            semesterGpa4: 0,
            totalSemesterCredits: 0
        };
        appData.semesters.push(newSemester);
        renderSemesterList(); // Cập nhật danh sách hiển thị
        saveAppData(); 
        
        if (setActive || appData.semesters.length === 1) { 
            selectSemester(newSemesterId);
        }
        calculateOverallCumulativeGpa(); // Cập nhật GPA tích lũy tổng
    };

    const deleteSemester = (semesterId) => {
        appData.semesters = appData.semesters.filter(sem => sem.id !== semesterId);
        if (appData.currentSemesterId === semesterId) {
            appData.currentSemesterId = appData.semesters.length > 0 ? appData.semesters[0].id : null;
        }
        renderSemesterList();
        saveAppData();
        calculateOverallCumulativeGpa(); 
    };

    const selectSemester = (semesterId) => {
        appData.currentSemesterId = semesterId;
        renderSemesterList(); 
        saveAppData();
    };

    const renderSemesterList = () => {
        semestersContainer.innerHTML = ''; 
        if (appData.semesters.length === 0) {
            semestersContainer.innerHTML = '<p class="info-message">Chưa có học kỳ nào. Hãy thêm một học kỳ mới!</p>';
            appData.currentSemesterId = null; 
            return;
        }

        appData.semesters.forEach(sem => {
            const semesterItem = document.createElement('div');
            semesterItem.className = `semester-item ${appData.currentSemesterId === sem.id ? 'active' : ''}`;
            semesterItem.dataset.id = sem.id;
            
            semesterItem.innerHTML = `
                <div class="semester-info">
                    <h3>${sem.name}</h3>
                    <p>GPA: <span>${sem.semesterGpa10.toFixed(2)}</span> (10) | <span>${sem.semesterGpa4.toFixed(2)}</span> (4)</p>
                    <p>Tín chỉ: <span>${sem.totalSemesterCredits}</span></p>
                </div>
                <div class="semester-actions">
                    <button class="edit-courses-btn action-button"><i class="fas fa-calculator"></i> Sửa điểm môn</button>
                    <button class="edit-semester-btn action-button-secondary"><i class="fas fa-edit"></i></button>
                    <button class="delete-semester-btn action-button-secondary"><i class="fas fa-trash"></i></button>
                </div>
            `;
            semestersContainer.appendChild(semesterItem);

            semesterItem.addEventListener('click', (e) => {
                if (!e.target.closest('.semester-actions button')) {
                    selectSemester(sem.id);
                }
            });

            semesterItem.querySelector('.edit-courses-btn').addEventListener('click', (e) => {
                e.stopPropagation(); 
                selectSemester(sem.id); 
                openCourseCalculatorDialog(sem.id); 
            });

            semesterItem.querySelector('.delete-semester-btn').addEventListener('click', (e) => {
                e.stopPropagation(); 
                if (confirm(`Bạn có chắc chắn muốn xóa học kỳ "${sem.name}" và tất cả môn học của nó?`)) {
                    deleteSemester(sem.id);
                }
            });
            semesterItem.querySelector('.edit-semester-btn').addEventListener('click', (e) => {
                e.stopPropagation(); 
                const newName = prompt(`Đổi tên học kỳ "${sem.name}" thành:`, sem.name);
                if (newName && newName.trim() !== '') {
                    sem.name = newName.trim();
                    renderSemesterList();
                    saveAppData();
                }
            });
        });
    };


    // --- HÀM TÍNH TOÁN GPA TÍCH LŨY TỔNG ---
    const calculateOverallCumulativeGpa = () => {
        let totalCumulativeWeightedScore10 = 0;
        let totalCumulativeWeightedScore4 = 0;
        let totalCumulativeCredits = 0;

        appData.semesters.forEach(sem => {
            if (sem.totalSemesterCredits > 0) {
                totalCumulativeWeightedScore10 += sem.semesterGpa10 * sem.totalSemesterCredits;
                totalCumulativeWeightedScore4 += sem.semesterGpa4 * sem.totalSemesterCredits;
                totalCumulativeCredits += sem.totalSemesterCredits;
            }
        });

        if (totalCumulativeCredits === 0) {
            overallCumulativeGpa10Span.textContent = '0.00';
            overallCumulativeGpa4Span.textContent = '0.00';
            overallCumulativeCreditsSpan.textContent = '0';
        } else {
            overallCumulativeGpa10Span.textContent = (totalCumulativeWeightedScore10 / totalCumulativeCredits).toFixed(2);
            overallCumulativeGpa4Span.textContent = (totalCumulativeWeightedScore4 / totalCumulativeCredits).toFixed(2);
            overallCumulativeCreditsSpan.textContent = totalCumulativeCredits;
        }
        saveAppData(); 
    };


    // --- HÀM MỞ/ĐÓNG DIALOG TÍNH ĐIỂM MÔN HỌC ---
    const openCourseCalculatorDialog = (semesterIdToEdit) => {
        const targetSemester = appData.semesters.find(sem => sem.id === semesterIdToEdit);
        if (!targetSemester) {
            alert('Lỗi: Không tìm thấy học kỳ này để sửa điểm.');
            return;
        }

        appData.currentSemesterId = semesterIdToEdit;
        dialogSemesterNameH2.textContent = `Tính Điểm Môn Học - ${targetSemester.name}`;
        courseCalculatorDialog.style.display = 'flex';
        mainWrapper.classList.add('blurred');

        dialogCoursesContainer.innerHTML = ''; 
        let maxIdInDialog = 0;
        if (targetSemester.courses.length > 0) {
            targetSemester.courses.forEach(courseData => {
                addCourseElementToDialog(courseData);
                if (parseInt(courseData.id) > maxIdInDialog) {
                    maxIdInDialog = parseInt(courseData.id);
                }
            });
        } else {
            addCourseElementToDialog();
        }
        dialogCoursesCounter = maxIdInDialog; 
        calculateDialogSemesterGpa(); 
    };

    const closeCourseCalculatorDialog = () => {
        courseCalculatorDialog.style.display = 'none';
        mainWrapper.classList.remove('blurred');
        renderSemesterList(); 
    };

    // --- HÀM CẬP NHẬT SECTION GPA KÌ VỌNG ---
    const updateExpectedGpaSection = () => {
        currentCumulativeGpa4ExpectedInput.value = overallCumulativeGpa4Span.textContent;
        currentCumulativeCreditsExpectedInput.value = overallCumulativeCreditsSpan.textContent;
        
        calculateExpectedGpa();
    };


    // --- HÀM TÍNH TOÁN GPA KÌ VỌNG ---
    const calculateExpectedGpa = () => {
        const currentGpa4 = parseFloat(currentCumulativeGpa4ExpectedInput.value);
        const currentCredits = parseFloat(currentCumulativeCreditsExpectedInput.value);
        const totalCreditsGraduation = parseFloat(totalCreditsForGraduationInput.value);
        const targetGpa4 = parseFloat(targetGpa4Input.value);

        if (isNaN(currentGpa4) || currentGpa4 < 0 || currentGpa4 > 4) {
            requiredGpaRemainingSpan.textContent = 'Lỗi';
            remainingCreditsSpan.textContent = 'Lỗi';
            displayTargetGpaSpan.textContent = targetGpa4Input.value;
            gap32Span.textContent = 'Lỗi';
            gap30Span.textContent = 'Lỗi';
            gap36Span.textContent = 'Lỗi';
            return;
        }
        if (isNaN(currentCredits) || currentCredits < 0) {
            requiredGpaRemainingSpan.textContent = 'Lỗi';
            remainingCreditsSpan.textContent = 'Lỗi';
            displayTargetGpaSpan.textContent = targetGpa4Input.value;
            gap32Span.textContent = 'Lỗi';
            gap30Span.textContent = 'Lỗi';
            gap36Span.textContent = 'Lỗi';
            return;
        }
        if (isNaN(totalCreditsGraduation) || totalCreditsGraduation <= 0) {
            requiredGpaRemainingSpan.textContent = 'Chưa đủ tín chỉ TN';
            remainingCreditsSpan.textContent = 'N/A';
            displayTargetGpaSpan.textContent = targetGpa4Input.value;
            gap32Span.textContent = 'N/A';
            gap30Span.textContent = 'N/A';
            gap36Span.textContent = 'N/A';
            return;
        }
        if (totalCreditsGraduation < currentCredits) {
            requiredGpaRemainingSpan.textContent = 'Tín chỉ TN < đã tích lũy';
            remainingCreditsSpan.textContent = 'N/A';
            displayTargetGpaSpan.textContent = targetGpa4Input.value;
            gap32Span.textContent = 'N/A';
            gap30Span.textContent = 'N/A';
            gap36Span.textContent = 'N/A';
            return;
        }
        if (isNaN(targetGpa4) || targetGpa4 < 0 || targetGpa4 > 4.0) {
            requiredGpaRemainingSpan.textContent = 'GPA kì vọng không hợp lệ';
            remainingCreditsSpan.textContent = 'N/A';
            displayTargetGpaSpan.textContent = targetGpa4Input.value;
            gap32Span.textContent = 'N/A';
            gap30Span.textContent = 'N/A';
            gap36Span.textContent = 'N/A';
            return;
        }

        const remainingCredits = totalCreditsGraduation - currentCredits;
        displayTargetGpaSpan.textContent = targetGpa4.toFixed(2); 

        if (remainingCredits <= 0) { 
            requiredGpaRemainingSpan.textContent = 'Đã đủ tín chỉ';
            remainingCreditsSpan.textContent = '0';
            if (currentGpa4 >= targetGpa4) {
                 requiredGpaRemainingSpan.textContent = `Đã đạt mục tiêu (${currentGpa4.toFixed(2)})`;
            } else {
                 requiredGpaRemainingSpan.textContent = `Không đạt (${currentGpa4.toFixed(2)})`;
            }
            gap32Span.textContent = 'N/A';
            gap30Span.textContent = 'N/A';
            gap36Span.textContent = 'N/A';
            return;
        }

        const currentTotalPoints = currentGpa4 * currentCredits;
        const targetTotalPoints = targetGpa4 * totalCreditsGraduation;
        const pointsNeededRemaining = targetTotalPoints - currentTotalPoints;
        
        let requiredGpaRemaining = pointsNeededRemaining / remainingCredits;

        if (requiredGpaRemaining < 0) requiredGpaRemaining = 0; 

        requiredGpaRemainingSpan.textContent = requiredGpaRemaining.toFixed(2);
        remainingCreditsSpan.textContent = remainingCredits;

        const calculateGap = (targetRankGpa) => {
            const targetRankTotalPoints = targetRankGpa * totalCreditsGraduation;
            const pointsNeededForRank = targetRankTotalPoints - currentTotalPoints;
            if (pointsNeededForRank <= 0) {
                return 'Đã đạt';
            }
            const gpaNeededForRank = pointsNeededForRank / remainingCredits;
            if (gpaNeededForRank > 4.0) {
                return 'Không thể đạt (>4.0)';
            }
            if (gpaNeededForRank < 0) { 
                return 'Đã đạt';
            }
            return gpaNeededForRank.toFixed(2);
        };

        gap32Span.textContent = calculateGap(3.2);
        gap30Span.textContent = calculateGap(3.0);
        gap36Span.textContent = calculateGap(3.6);
    };

       const parseScheduleData = (rawData) => {
        const lines = rawData.split('\n').filter(line => line.trim() !== '');
        const parsedSchedule = [];
        const dayMap = {
            'Thứ 2': 2, 'Thứ 3': 3, 'Thứ 4': 4, 'Thứ 5': 5, 'Thứ 6': 6, 'Thứ 7': 7, 'CN': 'CN'
        };
        const timeSessionMap = { // Mapping time ranges to session numbers
            '7:00-7:50': {start: 1, end: 1},
            '8:00-8:50': {start: 2, end: 2},
            '9:00-9:50': {start: 3, end: 3},
            '10:00-10:50': {start: 4, end: 4},
            '11:00-11:50': {start: 5, end: 5},
            '12:30-13:20': {start: 6, end: 6},
            '13:30-14:20': {start: 7, end: 7},
            '14:30-15:20': {start: 8, end: 8},
            '15:30-16:20': {start: 9, end: 9},
            '16:30-17:20': {start: 10, end: 10},
            '17:30-18:15': {start: 11, end: 11},
            '18:15-19:00': {start: 12, end: 12},
            '19:10-19:55': {start: 13, end: 13},
            '19:55-20:40': {start: 14, end: 14}
        };

        lines.forEach(line => {
            let match;
            let courseCode, courseName, credits, teacher, dayStr, timeLocStr, location, weeks;
            let timeRange, startSession, endSession;

            // --- Try matching Format 1 (The one that is NOT working) ---
            // Example: 1	4130120.2420.24.43	Anh văn B1.1	3			Nguyễn Thị Cẩm Hà	Thứ 2,1-4,H107	29-40
            // Groups: STT (ignored), MaMH, TenMH, TC, empty_col_1, empty_col_2, Teacher, Day,Time,Loc, Weeks
            match = line.match(
                /^\s*\d+\s+([^\s]+)\s+(.+?)\s+(\d+)\s+([^\s]*)\s+([^\s]*)\s+(.+?)\s+(Thứ\s+\d+|Chủ\s+Nhật|CN),(\d+-\d+),(\S+)\s+([\d-]+)(.*)$/i
            );

            if (match) {
                // Format 1 matched
                courseCode = match[1].trim();
                courseName = match[2].trim();
                credits = parseInt(match[3]);
                teacher = match[6].trim(); // Adjusted group index
                dayStr = match[7].trim(); // Adjusted group index
                timeRange = match[8].trim(); // Adjusted group index
                location = match[9].trim(); // Adjusted group index
                weeks = match[10].trim(); // Adjusted group index
                
                timeLocStr = `${dayStr},${timeRange},${location}`; // Reconstruct for console logging if needed

            } else {
                // --- Try matching Format 2 (The one that IS working) ---
                // Example: 1	1063293.2510.24.43	Cấu kiện điện tử	3	Phan Trần Đăng Khoa	Thứ 3: 9-10,B208	1-16	7/14/2025 4:05:19 PM
                // Groups: STT (ignored), MaMH, TenMH, TC, Teacher, Day:Time,Loc, Weeks, rest...
                match = line.match(/^\s*\d+\s+([^\s]+)\s+(.+?)\s+(\d+)\s+(.+?)\s+(Thứ\s+\d+|Chủ\s+Nhật|CN):\s*(\S+)\s*,\s*(\S+)\s+([\d-]+)(.*)/i);
                
                if (match) {
                    // Format 2 matched
                    courseCode = match[1].trim();
                    courseName = match[2].trim();
                    credits = parseInt(match[3]);
                    teacher = match[4].trim();
                    dayStr = match[5].trim();
                    timeRange = match[6].trim(); // 9-10
                    location = match[7].trim(); // B208
                    weeks = match[8].trim();

                    timeLocStr = `${dayStr}: ${timeRange},${location}`; // Reconstruct for console logging if needed
                }
            }
            
            // --- Common processing for both formats if a match was found ---
            if (match) {
                const dayOfWeek = dayMap[dayStr] || 'N/A';

                const sessionParts = timeRange.split('-');
                startSession = parseInt(sessionParts[0]);
                endSession = sessionParts.length > 1 ? parseInt(sessionParts[1]) : startSession;

                // Validate sessions (e.g., must be within 1-14)
                if (isNaN(startSession) || startSession < 1 || startSession > 14) {
                    console.warn(`Môn ${courseName}: Tiết bắt đầu "${timeRange}" không hợp lệ. Bỏ qua.`);
                    return;
                }
                if (isNaN(endSession) || endSession < startSession || endSession > 14) {
                     console.warn(`Môn ${courseName}: Tiết kết thúc "${timeRange}" không hợp lệ. Bỏ qua.`);
                    return;
                }

                if (dayOfWeek !== 'N/A' && startSession !== null && endSession !== null) {
                    parsedSchedule.push({
                        courseCode,
                        courseName,
                        credits,
                        teacher,
                        dayOfWeek: dayOfWeek,
                        timeRange: timeRange, // "1-4" or "9-10"
                        startSession: startSession,
                        endSession: endSession,
                        location,
                        weeks
                    });
                } else {
                    console.warn('Không thể phân tích đầy đủ thông tin cho dòng (thiếu ngày hoặc tiết hợp lệ):', line);
                }
            } else {
                console.warn('Không thể khớp định dạng dòng thời khóa biểu:', line);
            }
        });
        return parsedSchedule;
    };

    const renderSchedule = (filterDay = 'all') => {
       fullScheduleGrid.innerHTML = '';
        noScheduleMessageDiv.style.display = 'none'; // Hide message by default

        const daysOfWeek = {
            2: 'Thứ 2', 3: 'Thứ 3', 4: 'Thứ 4', 5: 'Thứ 5', 6: 'Thứ 6', 7: 'Thứ 7', 'CN': 'CN'
        };

        const timeSlots = [
            { session: 1, time: '7:00-7:50' },
            { session: 2, time: '8:00-8:50' },
            { session: 3, time: '9:00-9:50' },
            { session: 4, time: '10:00-10:50' },
            { session: 5, time: '11:00-11:50' },
            { session: 6, time: '12:30-13:20' },
            { session: 7, time: '13:30-14:20' },
            { session: 8, time: '14:30-15:20' },
            { session: 9, time: '15:30-16:20' },
            { session: 10, time: '16:30-17:20' },
            { session: 11, time: '17:30-18:15' },
            { session: 12, time: '18:15-19:00' },
            { session: 13, time: '19:10-19:55' },
            { session: 14, time: '19:55-20:40' }
        ];

        // Determine which days to display based on filter
        const displayedDays = filterDay === 'all' ? Object.keys(daysOfWeek).sort((a,b) => {
            if (a === 'CN') return 1;
            if (b === 'CN') return -1;
            return parseInt(a) - parseInt(b);
        }) : [filterDay.toString()];

        // Check if there's any schedule data at all
        if (appData.schedule.length === 0) {
            noScheduleMessageDiv.style.display = 'block';
            return;
        }

        // Set up grid columns based on displayed days
        fullScheduleGrid.style.gridTemplateColumns = `80px repeat(${displayedDays.length}, minmax(150px, 1fr))`;

        // 1. Create top-left empty cell
        const emptyCorner = document.createElement('div');
        emptyCorner.classList.add('grid-cell', 'grid-header', 'time-header');
        fullScheduleGrid.appendChild(emptyCorner);

        // 2. Create day headers
        displayedDays.forEach(dayKey => {
            const dayHeader = document.createElement('div');
            dayHeader.classList.add('grid-cell', 'grid-header');
            dayHeader.textContent = daysOfWeek[dayKey];
            fullScheduleGrid.appendChild(dayHeader);
        });

        // 3. Populate grid with time slots and courses
        timeSlots.forEach(slot => {
            // Add time slot cell
            const timeCell = document.createElement('div');
            timeCell.classList.add('grid-cell', 'time-slot');
            timeCell.innerHTML = `${slot.time}<br>(${slot.session})`;
            fullScheduleGrid.appendChild(timeCell);

            // Add course cells for each day
            displayedDays.forEach(dayKey => {
                const courseCell = document.createElement('div');
                courseCell.classList.add('grid-cell');
                
                // Find courses for this day and this time slot
                const coursesInSlot = appData.schedule.filter(course =>
                    course.dayOfWeek.toString() === dayKey &&
                    (slot.session >= course.startSession && slot.session <= course.endSession)
                );

                if (coursesInSlot.length > 0) {
                    coursesInSlot.forEach(course => {
                        const courseItemDiv = document.createElement('div');
                        courseItemDiv.classList.add('grid-course-item');
                        courseItemDiv.innerHTML = `
                            <p class="course-name">${course.courseName}</p>
                           
                            <p class="course-info">${course.location}</p>
                        `;
                     
                        courseCell.appendChild(courseItemDiv);
                    });
                }
                fullScheduleGrid.appendChild(courseCell);
            });
        });

        // Cập nhật trạng thái
        scheduleFilterButtons.forEach(btn => {
            if (btn.dataset.day === filterDay) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    };

    // --- HÀM QUẢN LÝ MÔN HỌC TRONG DIALOG ---
    let dialogCoursesCounter = 0;

    const addCourseElementToDialog = (data = {}) => {
        const currentCourseId = data.id ? parseInt(data.id) : ++dialogCoursesCounter; 
        
        const newCourseItem = document.createElement('div');
        newCourseItem.classList.add('course-item');
        newCourseItem.dataset.id = currentCourseId;

        const defaultCourseName = data.courseName || '';
        const defaultCredits = data.credits || '3';
        const defaultAssignment = data.assignment || '0';
        const defaultWeightAssignment = data.weightAssignment || '20';
        const defaultMidterm = data.midterm || '0';
        const defaultWeightMidterm = data.weightMidterm || '20';
        const defaultFinal = data.final || '0';
        const defaultWeightFinal = data.weightFinal || '60';

        newCourseItem.innerHTML = `
            <div class="course-header">
                <div class="course-title-and-name">
                    <h3>Môn học ${currentCourseId}</h3>
                    <div class="input-group course-name-input">
                        <label for="dialogCourseName${currentCourseId}">Tên môn học:</label>
                        <input type="text" id="dialogCourseName${currentCourseId}" value="${defaultCourseName}">
                    </div>
                </div>
                <div class="course-summary-results">
                    <div class="subject-final-gpa-display">
                        <p>Điểm TB môn (Thang 10): <span class="subject-gpa10">0.00</span></p>
                        <p>Điểm TB môn (Thang 4): <span class="subject-gpa4">0.00</span></p>
                    </div>
                </div>
                <button class="remove-course-btn">Xóa</button>
            </div>
            
            <div class="course-details">
                <div class="input-group">
                    <label for="dialogCredits${currentCourseId}">Tín chỉ:</label>
                    <input type="number" id="dialogCredits${currentCourseId}" value="${defaultCredits}" min="1">
                </div>
                
                <div class="score-weight-group">
                    <div class="input-group">
                        <label for="dialogAssignment${currentCourseId}">Điểm BT:</label>
                        <input type="number" id="dialogAssignment${currentCourseId}" value="${defaultAssignment}" min="0" max="10" step="0.1">
                    </div>
                    <div class="input-group weight-input-group">
                        <label for="dialogWeightAssignment${currentCourseId}">Trọng số BT (%):</label>
                        <input type="number" id="dialogWeightAssignment${currentCourseId}" value="${defaultWeightAssignment}" min="0" max="100" class="weight-input">
                    </div>
                </div>

                <div class="score-weight-group">
                    <div class="input-group">
                        <label for="dialogMidterm${currentCourseId}">Điểm GK:</label>
                        <input type="number" id="dialogMidterm${currentCourseId}" value="${defaultMidterm}" min="0" max="10" step="0.1">
                    </div>
                    <div class="input-group weight-input-group">
                        <label for="dialogWeightMidterm${currentCourseId}">Trọng số GK (%):</label>
                        <input type="number" id="dialogWeightMidterm${currentCourseId}" value="${defaultWeightMidterm}" min="0" max="100" class="weight-input">
                    </div>
                </div>

                <div class="score-weight-group">
                    <div class="input-group">
                        <label for="dialogFinal${currentCourseId}">Điểm CK:</label>
                        <input type="number" id="dialogFinal${currentCourseId}" value="${defaultFinal}" min="0" max="10" step="0.1">
                    </div>
                    <div class="input-group weight-input-group">
                        <label for="weightFinal${currentCourseId}">Trọng số CK (%):</label>
                        <input type="number" id="dialogWeightFinal${currentCourseId}" value="${defaultWeightFinal}" min="0" max="100" class="weight-input">
                    </div>
                </div>

            </div>
        `;
        dialogCoursesContainer.appendChild(newCourseItem);

        attachCourseEventListenersToDialog(newCourseItem); 
        updateSubjectResultsInDialog(newCourseItem); 
    };

    const attachCourseEventListenersToDialog = (courseItemElement) => {
        const removeButton = courseItemElement.querySelector('.remove-course-btn');
        if (removeButton) {
            removeButton.addEventListener('click', (e) => {
                e.target.closest('.course-item').remove();
                calculateDialogSemesterGpa(); 
            });
        }

        const inputs = courseItemElement.querySelectorAll('input[type="number"], input[type="text"]');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                updateSubjectResultsInDialog(courseItemElement); 
                calculateDialogSemesterGpa(); 
            });
        });
    };

    const updateSubjectResultsInDialog = (courseItemElement) => {
        const id = courseItemElement.dataset.id;
        
        const creditsInput = courseItemElement.querySelector(`#dialogCredits${id}`);
        const assignmentInput = courseItemElement.querySelector(`#dialogAssignment${id}`);
        const midtermInput = courseItemElement.querySelector(`#dialogMidterm${id}`);
        const finalInput = courseItemElement.querySelector(`#dialogFinal${id}`);
        const weightAssignmentInput = courseItemElement.querySelector(`#dialogWeightAssignment${id}`);
        const weightMidtermInput = courseItemElement.querySelector(`#dialogWeightMidterm${id}`);
        const weightFinalInput = courseItemElement.querySelector(`#dialogWeightFinal${id}`);
        
        const subjectGpa10Span = courseItemElement.querySelector('.subject-final-gpa-display .subject-gpa10');
        const subjectGpa4Span = courseItemElement.querySelector('.subject-final-gpa-display .subject-gpa4');

        const assignmentScore = parseFloat(assignmentInput.value);
        const midtermScore = parseFloat(midtermInput.value);
        const finalScore = parseFloat(finalInput.value);
        const weightAssignment = parseFloat(weightAssignmentInput.value);
        const weightMidterm = parseFloat(weightMidtermInput.value);
        const weightFinal = parseFloat(weightFinalInput.value);

        const subjectAverageScore = calculateSubjectAverageScore(
            assignmentScore, midtermScore, finalScore,
            weightAssignment, weightMidterm, weightFinal
        );

        const letterGrade = convertScoreToLetterGrade(subjectAverageScore);
        subjectGpa10Span.innerHTML = `${subjectAverageScore.toFixed(2)} (${letterGrade})`; 
        subjectGpa4Span.textContent = convertToGpa4(subjectAverageScore).toFixed(2);
    };

    const calculateDialogSemesterGpa = () => {
        let currentSemesterTotalWeightedScore10 = 0;
        let currentSemesterTotalWeightedScore4 = 0;
        let currentSemesterTotalCredits = 0;
        
        const dialogCourseItems = dialogCoursesContainer.querySelectorAll('.course-item');
        
        dialogCourseItems.forEach(courseItem => {
            const id = courseItem.dataset.id;
            const credits = parseFloat(courseItem.querySelector(`#dialogCredits${id}`).value);
            const assignmentScore = parseFloat(courseItem.querySelector(`#dialogAssignment${id}`).value);
            const midtermScore = parseFloat(courseItem.querySelector(`#dialogMidterm${id}`).value);
            const finalScore = parseFloat(courseItem.querySelector(`#dialogFinal${id}`).value);
            const weightAssignment = parseFloat(courseItem.querySelector(`#dialogWeightAssignment${id}`).value);
            const weightMidterm = parseFloat(courseItem.querySelector(`#dialogWeightMidterm${id}`).value);
            const weightFinal = parseFloat(courseItem.querySelector(`#dialogWeightFinal${id}`).value);

            const subjectAverageScore = calculateSubjectAverageScore(
                assignmentScore, midtermScore, finalScore,
                weightAssignment, weightMidterm, weightFinal
            );

            if (!isNaN(subjectAverageScore) && credits > 0) {
                currentSemesterTotalWeightedScore10 += subjectAverageScore * credits;
                currentSemesterTotalWeightedScore4 += convertToGpa4(subjectAverageScore) * credits;
                currentSemesterTotalCredits += credits;
            }
        });

        if (currentSemesterTotalCredits === 0) {
            dialogGpa10Span.textContent = '0.00';
            dialogGpa4Span.textContent = '0.00';
            dialogTotalCreditsSpan.textContent = '0';
        } else {
            dialogGpa10Span.textContent = (currentSemesterTotalWeightedScore10 / currentSemesterTotalCredits).toFixed(2);
            dialogGpa4Span.textContent = (currentSemesterTotalWeightedScore4 / currentSemesterTotalCredits).toFixed(2);
            dialogTotalCreditsSpan.textContent = currentSemesterTotalCredits;
        }
    };


    // --- HÀM XỬ LÝ LOCAL STORAGE VIEWER ---
    const openLocalStorageViewer = () => {
        const storedJson = localStorage.getItem('gpaManagementData');
        localstorageJsonTextarea.value = storedJson ? JSON.stringify(JSON.parse(storedJson), null, 2) : ''; 
        localstorageViewerDialog.style.display = 'flex';
        mainWrapper.classList.add('blurred');
    };

    const closeLocalStorageViewer = () => {
        localstorageViewerDialog.style.display = 'none';
        mainWrapper.classList.remove('blurred');
    };

    const saveLocalStorageJson = () => {
        const newJsonString = localstorageJsonTextarea.value;
        try {
            const parsedData = JSON.parse(newJsonString);
            localStorage.setItem('gpaManagementData', newJsonString);
            alert('Dữ liệu Local Storage đã được cập nhật thành công!');
            closeLocalStorageViewer();
            loadAppData(); 
            renderSemesterList();
            calculateOverallCumulativeGpa();
            showSection('semester-list-section'); 
        } catch (e) {
            alert('Lỗi: Dữ liệu JSON không hợp lệ. Vui lòng kiểm tra cú pháp.');
            console.error('JSON parse error:', e);
        }
    };


    // --- SỰ KIỆN NÚT VÀ LOGIC CHÍNH ---

    // Gắn sự kiện cho các nút điều hướng menu
    showSemesterListBtn.addEventListener('click', () => showSection('semester-list-section'));
    showOverallGpaBtn.addEventListener('click', () => {
        showSection('overall-gpa-section');
        calculateOverallCumulativeGpa();
    });
    showExpectedGpaBtn.addEventListener('click', () => {
        showSection('expected-gpa-section');
        updateExpectedGpaSection();
    });
    openLocalStorageViewerBtn.addEventListener('click', openLocalStorageViewer); 
    showScheduleBtn.addEventListener('click', () => showSection('schedule-section'));
    
    // --- GẮN SỰ KIỆN CHO PHẦN THỜI KHÓA BIỂU ---
    processScheduleDataBtn.addEventListener('click', () => {
        const rawData = scheduleInputTextarea.value;
        appData.schedule = parseScheduleData(rawData);
        saveAppData();
        renderSchedule();
        alert('Thời khóa biểu đã được xử lý và lưu!');
    });

    clearScheduleBtn.addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn xóa toàn bộ thời khóa biểu?')) {
            appData.schedule = [];
            saveAppData();
            renderSchedule();
            scheduleInputTextarea.value = '';
            alert('Thời khóa biểu đã được xóa.');
        }
    });

    scheduleFilterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const day = e.target.dataset.day;
            renderSchedule(day);
        });
    });


    // Gắn sự kiện cho nút Thêm Học kỳ
    addSemesterBtn.addEventListener('click', () => {
        const semesterName = prompt('Nhập tên học kỳ mới (ví dụ: Học kỳ 1, Năm 2):');
        if (semesterName && semesterName.trim() !== '') {
            addSemester(semesterName.trim(), true);
        }
    });


    // Gắn sự kiện cho dialog TÍNH ĐIỂM MÔN HỌC
    closeCourseDialogButton.addEventListener('click', closeCourseCalculatorDialog);
    window.addEventListener('click', (event) => {
        if (event.target === courseCalculatorDialog) {
            closeCourseCalculatorDialog();
        }
    });

    addCourseDialogBtn.addEventListener('click', () => {
        addCourseElementToDialog();
        calculateDialogSemesterGpa();
    });

    calculateAndSaveCoursesBtn.addEventListener('click', () => {
        const currentSemester = appData.semesters.find(sem => sem.id === appData.currentSemesterId);
        if (!currentSemester) {
            alert('Lỗi: Không có học kỳ nào được chọn để lưu điểm. Vui lòng thêm/chọn một học kỳ.');
            return;
        }

        let dialogErrors = [];
        let semesterCoursesToSave = [];
        let semesterTotalWeightedScore10 = 0;
        let semesterTotalWeightedScore4 = 0;
        let semesterTotalCredits = 0;

        const dialogCourseItems = dialogCoursesContainer.querySelectorAll('.course-item');
        
        if (dialogCourseItems.length === 0) {
            currentSemester.courses = []; 
            currentSemester.semesterGpa10 = 0;
            currentSemester.semesterGpa4 = 0;
            currentSemester.totalSemesterCredits = 0;
            saveAppData();
            renderSemesterList(); 
            calculateOverallCumulativeGpa(); 
            closeCourseCalculatorDialog();
            alert(`Điểm cho học kỳ "${currentSemester.name}" đã được cập nhật (không có môn học nào).`);
            return;
        }

        dialogCourseItems.forEach(courseItem => {
            const id = courseItem.dataset.id;
            const courseName = courseItem.querySelector(`#dialogCourseName${id}`).value.trim() || `Môn học ${id}`;

            const credits = parseFloat(courseItem.querySelector(`#dialogCredits${id}`).value);
            const assignmentScore = parseFloat(courseItem.querySelector(`#dialogAssignment${id}`).value);
            const midtermScore = parseFloat(courseItem.querySelector(`#dialogMidterm${id}`).value);
            const finalScore = parseFloat(courseItem.querySelector(`#dialogFinal${id}`).value);
            const weightAssignment = parseFloat(courseItem.querySelector(`#dialogWeightAssignment${id}`).value);
            const weightMidterm = parseFloat(courseItem.querySelector(`#dialogWeightMidterm${id}`).value);
            const weightFinal = parseFloat(courseItem.querySelector(`#dialogWeightFinal${id}`).value);

            let isCourseValidToSave = true; 

            if (isNaN(credits) || credits <= 0) {
                dialogErrors.push(`Môn học "${courseName}": Số tín chỉ không hợp lệ hoặc thiếu.`);
                isCourseValidToSave = false;
            }
            if (isNaN(weightAssignment) || weightAssignment < 0 || 
                isNaN(weightMidterm) || weightMidterm < 0 || 
                isNaN(weightFinal) || weightFinal < 0) {
                 dialogErrors.push(`Môn học "${courseName}": Trọng số không hợp lệ (phải là số không âm) hoặc thiếu.`);
                 isCourseValidToSave = false;
            }
            
            const allWeightsProvided = !isNaN(weightAssignment) && !isNaN(weightMidterm) && !isNaN(weightFinal);
            const totalWeightsSum = (isNaN(weightAssignment) ? 0 : weightAssignment) + 
                                    (isNaN(weightMidterm) ? 0 : weightMidterm) + 
                                    (isNaN(weightFinal) ? 0 : weightFinal);

            if (allWeightsProvided && totalWeightsSum !== 100) {
                 dialogErrors.push(`Môn học "${courseName}": Tổng trọng số điểm (${totalWeightsSum}%) phải bằng 100% khi tất cả các trọng số được nhập.`);
                 isCourseValidToSave = false;
            } else if (totalWeightsSum > 0 && totalWeightsSum !== 100 && !allWeightsProvided) {
                 dialogErrors.push(`Môn học "${courseName}": Tổng trọng số các phần điểm đã nhập (${totalWeightsSum}%) không hợp lệ. Vui lòng đảm bảo tổng trọng số của các phần điểm được nhập bằng 100%.`);
                 isCourseValidToSave = false;
            } else if (totalWeightsSum === 0 && (isNaN(assignmentScore) && isNaN(midtermScore) && isNaN(finalScore)) && credits > 0) {
                 dialogErrors.push(`Môn học "${courseName}": Thiếu điểm hoặc trọng số để tính Điểm TB Môn.`);
                 isCourseValidToSave = false;
            }

            const validateScoreValue = (score, scoreName) => {
                if (!isNaN(score) && (score < 0 || score > 10)) {
                    dialogErrors.push(`Môn học "${courseName}": Điểm ${scoreName} không hợp lệ (phải từ 0-10).`);
                    return false;
                }
                return true;
            };

            if ( (!isNaN(assignmentScore) && !validateScoreValue(assignmentScore, 'bài tập')) ||
                 (!isNaN(midtermScore) && !validateScoreValue(midtermScore, 'giữa kỳ')) ||
                 (!isNaN(finalScore) && !validateScoreValue(finalScore, 'cuối kỳ')) ) {
                isCourseValidToSave = false;
            }

            if (isCourseValidToSave) {
                const subjectAverageScore = calculateSubjectAverageScore(assignmentScore, midtermScore, finalScore, weightAssignment, weightMidterm, weightFinal);
                
                const courseDataForSave = {
                    id: id,
                    courseName: courseName,
                    credits: credits,
                    assignment: assignmentScore, 
                    weightAssignment: weightAssignment, 
                    midterm: midtermScore,
                    weightMidterm: weightMidterm,
                    final: finalScore,
                    weightFinal: weightFinal,
                    finalSubjectGpa10: subjectAverageScore, 
                    finalSubjectGpa4: convertToGpa4(subjectAverageScore)
                };
                semesterCoursesToSave.push(courseDataForSave);

                semesterTotalWeightedScore10 += subjectAverageScore * credits;
                semesterTotalWeightedScore4 += convertToGpa4(subjectAverageScore) * credits;
                semesterTotalCredits += credits;
            }
        }); 

        if (dialogErrors.length > 0) {
            alert("Không thể lưu điểm học kỳ do lỗi:\n\n" + dialogErrors.join("\n") + "\n\nVui lòng sửa các lỗi trên để lưu.");
        } else {
            currentSemester.courses = semesterCoursesToSave;
            
            if (semesterTotalCredits === 0) {
                currentSemester.semesterGpa10 = 0;
                currentSemester.semesterGpa4 = 0;
                currentSemester.totalSemesterCredits = 0;
            } else {
                currentSemester.semesterGpa10 = semesterTotalWeightedScore10 / semesterTotalCredits;
                currentSemester.semesterGpa4 = semesterTotalWeightedScore4 / semesterTotalCredits;
                currentSemester.totalSemesterCredits = semesterTotalCredits;
            }

            saveAppData(); 
            renderSemesterList(); 
            calculateOverallCumulativeGpa(); 
            closeCourseCalculatorDialog(); 
            alert(`Điểm cho học kỳ "${currentSemester.name}" đã được lưu thành công!`);
        }
    }); 

    clearAllCoursesDialogBtn.addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn xóa TẤT CẢ các môn học đang có trong dialog? (Học kỳ sẽ trống)')) {
            dialogCoursesContainer.innerHTML = ''; 
            calculateDialogSemesterGpa(); 
        }
    });

    // --- SỰ KIỆN NÚT VÀ LOGIC TRONG SECTION GPA KÌ VỌNG ---
    calculateExpectedGpaButton.addEventListener('click', calculateExpectedGpa);
    totalCreditsForGraduationInput.addEventListener('input', calculateExpectedGpa);
    targetGpa4Input.addEventListener('input', calculateExpectedGpa);


    // --- GẮN SỰ KIỆN CHO DIALOG LOCAL STORAGE VIEWER ---
    closeLocalStorageViewerButton.addEventListener('click', closeLocalStorageViewer);
    closeLocalstorageViewerBtn.addEventListener('click', closeLocalStorageViewer);
    localstorageViewerDialog.addEventListener('click', (event) => {
        if (event.target === localstorageViewerDialog) {
            closeLocalStorageViewer();
        }
    });
    saveLocalstorageJsonBtn.addEventListener('click', saveLocalStorageJson);


    // --- KHỞI TẠO ỨNG DỤNG ---
    loadAppData(); 
    renderSemesterList(); 
    calculateOverallCumulativeGpa(); 
    showSection('semester-list-section'); 
});