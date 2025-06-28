document.addEventListener('DOMContentLoaded', () => {
    const coursesContainer = document.getElementById('courses-container');
    const addCourseBtn = document.getElementById('add-course');
    const calculateGpaBtn = document.getElementById('calculate-gpa');
    const overallGpa10Span = document.getElementById('overall-gpa10');
    const overallGpa4Span = document.getElementById('overall-gpa4');
    const totalCreditsDisplay = document.getElementById('total-credits-display');

    let courseCounter = 1;
    let errorsFoundDuringCalc = []; // Mảng để lưu trữ các thông báo lỗi

    const convertScoreToLetterGrade = (score10) => {
        if (score10 >= 9.5) return 'A+';
        if (score10 >= 8.5) return 'A';
        if (score10 >= 8.0) return 'B+';
        if (score10 >= 7.0) return 'B';
        if (score10 >= 6.5) return 'C+';
        if (score10 >= 5.5) return 'C';
        if (score10 >= 5.0) return 'D+';
        if (score10 >= 4.0) return 'D';
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

    const updateSubjectResults = (courseItemElement) => {
        const id = courseItemElement.dataset.id;
        
        const creditsInput = courseItemElement.querySelector(`#credits${id}`);
        const assignmentInput = courseItemElement.querySelector(`#assignment${id}`);
        const midtermInput = courseItemElement.querySelector(`#midterm${id}`);
        const finalInput = courseItemElement.querySelector(`#final${id}`);
        const weightAssignmentInput = courseItemElement.querySelector(`#weightAssignment${id}`);
        const weightMidtermInput = courseItemElement.querySelector(`#weightMidterm${id}`);
        const weightFinalInput = courseItemElement.querySelector(`#weightFinal${id}`);
        
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

    const attachCourseEventListeners = (courseItemElement) => {
        courseItemElement.querySelector('.remove-course-btn').addEventListener('click', (e) => {
            e.target.closest('.course-item').remove();
            calculateOverallGpa(false); 
        });

        const inputs = courseItemElement.querySelectorAll('input[type="number"], input[type="text"]');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                updateSubjectResults(courseItemElement);
                calculateOverallGpa(false); 
            });
        });
    };

    // Hàm tính toán GPA tổng. Tham số 'showAlert' để kiểm soát việc hiển thị alert
    const calculateOverallGpa = (showAlert = false) => {
        let totalWeightedScore10 = 0;
        let totalWeightedScore4 = 0;
        let totalCredits = 0;
        errorsFoundDuringCalc = []; 

        const courseItems = document.querySelectorAll('.course-item');
        
        if (courseItems.length === 0) {
            overallGpa10Span.textContent = '0.00';
            overallGpa4Span.textContent = '0.00';
            totalCreditsDisplay.textContent = '0';
            return;
        }

        courseItems.forEach(courseItem => {
            const id = courseItem.dataset.id;
            const courseName = courseItem.querySelector(`#courseName${id}`).value.trim() || `Môn học ${id}`;

            const credits = parseFloat(courseItem.querySelector(`#credits${id}`).value);
            const assignmentScore = parseFloat(courseItem.querySelector(`#assignment${id}`).value);
            const midtermScore = parseFloat(courseItem.querySelector(`#midterm${id}`).value);
            const finalScore = parseFloat(courseItem.querySelector(`#final${id}`).value);
            const weightAssignment = parseFloat(courseItem.querySelector(`#weightAssignment${id}`).value);
            const weightMidterm = parseFloat(courseItem.querySelector(`#weightMidterm${id}`).value);
            const weightFinal = parseFloat(courseItem.querySelector(`#weightFinal${id}`).value);

            let isCourseValidForOverall = true; 

            // 1. Kiểm tra tín chỉ
            if (isNaN(credits) || credits <= 0) {
                errorsFoundDuringCalc.push(`Môn học "${courseName}": Số tín chỉ không hợp lệ hoặc thiếu.`);
                isCourseValidForOverall = false;
            }

            // 2. Kiểm tra trọng số cơ bản (phải là số, không âm)
            if (isNaN(weightAssignment) || weightAssignment < 0 || 
                isNaN(weightMidterm) || weightMidterm < 0 || 
                isNaN(weightFinal) || weightFinal < 0) {
                 errorsFoundDuringCalc.push(`Môn học "${courseName}": Trọng số không hợp lệ (phải là số không âm) hoặc thiếu.`);
                 isCourseValidForOverall = false;
            }
            
            // 3. Kiểm tra tổng trọng số
            const allWeightsProvided = !isNaN(weightAssignment) && !isNaN(weightMidterm) && !isNaN(weightFinal);
            const totalWeightsSum = (isNaN(weightAssignment) ? 0 : weightAssignment) + 
                                    (isNaN(weightMidterm) ? 0 : weightMidterm) + 
                                    (isNaN(weightFinal) ? 0 : weightFinal);

            if (allWeightsProvided && totalWeightsSum !== 100) {
                 errorsFoundDuringCalc.push(`Môn học "${courseName}": Tổng trọng số điểm (${totalWeightsSum}%) phải bằng 100% khi tất cả các trọng số được nhập.`);
                 isCourseValidForOverall = false;
            } else if (totalWeightsSum > 0 && totalWeightsSum !== 100 && !allWeightsProvided) {
                 errorsFoundDuringCalc.push(`Môn học "${courseName}": Tổng trọng số các phần điểm đã nhập (${totalWeightsSum}%) không hợp lệ. Vui lòng đảm bảo tổng trọng số của các phần điểm được nhập bằng 100%.`);
                 isCourseValidForOverall = false;
            } else if (totalWeightsSum === 0 && (isNaN(assignmentScore) && isNaN(midtermScore) && isNaN(finalScore)) && credits > 0) {
                 errorsFoundDuringCalc.push(`Môn học "${courseName}": Thiếu điểm hoặc trọng số để tính Điểm TB Môn.`);
                 isCourseValidForOverall = false;
            }


            // 4. Kiểm tra điểm có hợp lệ không (0-10)
            const validateScoreValue = (score, scoreName) => {
                if (!isNaN(score) && (score < 0 || score > 10)) {
                    errorsFoundDuringCalc.push(`Môn học "${courseName}": Điểm ${scoreName} không hợp lệ (phải từ 0-10).`);
                    return false;
                }
                return true;
            };

            if ( (!isNaN(assignmentScore) && !validateScoreValue(assignmentScore, 'bài tập')) ||
                 (!isNaN(midtermScore) && !validateScoreValue(midtermScore, 'giữa kỳ')) ||
                 (!isNaN(finalScore) && !validateScoreValue(finalScore, 'cuối kỳ')) ) {
                isCourseValidForOverall = false;
            }

            if (!isCourseValidForOverall) {
                return; 
            }

            const subjectAverageScore = calculateSubjectAverageScore(
                assignmentScore, midtermScore, finalScore,
                weightAssignment, weightMidterm, weightFinal
            );

            if (credits > 0) { 
                totalWeightedScore10 += subjectAverageScore * credits;
                totalWeightedScore4 += convertToGpa4(subjectAverageScore) * credits;
                totalCredits += credits;
            }
        });

        
        if (errorsFoundDuringCalc.length > 0) {
            if (showAlert) {
                alert("Đã xảy ra lỗi khi tính toán GPA:\n\n" + errorsFoundDuringCalc.join("\n") + "\n\nCác môn học có lỗi sẽ không được tính vào GPA tổng.");
            }
            overallGpa10Span.textContent = 'Lỗi';
            overallGpa4Span.textContent = 'Lỗi';
            totalCreditsDisplay.textContent = '0';
        } else if (totalCredits === 0) {
            overallGpa10Span.textContent = '0.00';
            overallGpa4Span.textContent = '0.00';
            totalCreditsDisplay.textContent = '0';
        } else {
            overallGpa10Span.textContent = (totalWeightedScore10 / totalCredits).toFixed(2);
            overallGpa4Span.textContent = (totalWeightedScore4 / totalCredits).toFixed(2);
            totalCreditsDisplay.textContent = totalCredits;
        }
    };


    const initialCourseItem = document.querySelector('.course-item[data-id="1"]');
    attachCourseEventListeners(initialCourseItem);
    updateSubjectResults(initialCourseItem); 
    calculateOverallGpa(false); 

    addCourseBtn.addEventListener('click', () => {
        courseCounter++;
        const newCourseItem = document.createElement('div');
        newCourseItem.classList.add('course-item');
        newCourseItem.dataset.id = courseCounter;

        newCourseItem.innerHTML = `
            <div class="course-header">
                <div class="course-title-and-name">
                    <h3>Môn học ${courseCounter}</h3>
                    <div class="input-group course-name-input">
                        <label for="courseName${courseCounter}">Tên môn học:</label>
                        <input type="text" id="courseName${courseCounter}">
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
                    <label for="credits${courseCounter}">Tín chỉ:</label>
                    <input type="number" id="credits${courseCounter}" value="3" min="1">
                </div>
                
                <div class="score-weight-group">
                    <div class="input-group">
                        <label for="assignment${courseCounter}">Điểm BT:</label>
                        <input type="number" id="assignment${courseCounter}" value="0" min="0" max="10" step="0.1">
                    </div>
                    <div class="input-group weight-input-group">
                        <label for="weightAssignment${courseCounter}">Trọng số BT (%):</label>
                        <input type="number" id="weightAssignment${courseCounter}" value="20" min="0" max="100" class="weight-input">
                    </div>
                </div>

                <div class="score-weight-group">
                    <div class="input-group">
                        <label for="midterm${courseCounter}">Điểm GK:</label>
                        <input type="number" id="midterm${courseCounter}" value="0" min="0" max="10" step="0.1">
                    </div>
                    <div class="input-group weight-input-group">
                        <label for="weightMidterm${courseCounter}">Trọng số GK (%):</label>
                        <input type="number" id="weightMidterm${courseCounter}" value="20" min="0" max="100" class="weight-input">
                    </div>
                </div>

                <div class="score-weight-group">
                    <div class="input-group">
                        <label for="final${courseCounter}">Điểm CK:</label>
                        <input type="number" id="final${courseCounter}" value="0" min="0" max="10" step="0.1">
                    </div>
                    <div class="input-group weight-input-group">
                        <label for="weightFinal${courseCounter}">Trọng số CK (%):</label>
                        <input type="number" id="weightFinal${courseCounter}" value="60" min="0" max="100" class="weight-input">
                    </div>
                </div>

            </div>
        `;
        coursesContainer.appendChild(newCourseItem);

        attachCourseEventListeners(newCourseItem);
        updateSubjectResults(newCourseItem);
        calculateOverallGpa(false); // Tính toán khi thêm môn mới không báo lỗi
    });

    // Sự kiện click nút "Tính GPA Tổng" sẽ gọi calculateOverallGpa(true) để báo lỗi
    calculateGpaBtn.addEventListener('click', () => {
        calculateOverallGpa(true); // Khi click nút, BÁO LỖI
    });
});