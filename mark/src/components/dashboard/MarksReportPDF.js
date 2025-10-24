'use client';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate PDF report for student marks - Single Page Layout
 */
export function generateMarksReportPDF(marksData, selectedClass, testInfo) {
  const doc = new jsPDF();
  
  // Add SRM Logo - Load and wait for it
  const logo = new Image();
  logo.src = '/logo.png';
  
  // Header - Compact
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, 210, 25, 'F');
  
  // Add logo after loading
  if (logo.complete) {
    doc.addImage(logo, 'PNG', 10, 5, 15, 15);
  } else {
    logo.onload = () => {
      doc.addImage(logo, 'PNG', 10, 5, 15, 15);
    };
  }
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('SRM INSTITUTE - MARKS EVALUATION REPORT', 105, 10, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`${testInfo?.test_name || 'N/A'} - ${testInfo?.subject_name || 'N/A'} (${testInfo?.subject_code || 'N/A'}) | Class: ${selectedClass}`, 105, 18, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Test Information - Compact
  doc.setFontSize(8);
  doc.text(`Max Marks: ${testInfo?.max_marks || 'N/A'}`, 14, 32);
  doc.text(`Converted: ${testInfo?.converted_max_marks || 'N/A'}`, 60, 32);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 100, 32);
  doc.text(`Students: ${marksData.length}`, 150, 32);
  
  // Calculate statistics
  const totalMarks = marksData.reduce((sum, m) => sum + parseFloat(m.marks_obtained || 0), 0);
  const avgMarks = marksData.length > 0 ? (totalMarks / marksData.length).toFixed(2) : 0;
  const highestMarks = marksData.length > 0 ? Math.max(...marksData.map(m => parseFloat(m.marks_obtained || 0))) : 0;
  const lowestMarks = marksData.length > 0 ? Math.min(...marksData.map(m => parseFloat(m.marks_obtained || 0))) : 0;
  const passCount = marksData.filter(m => parseFloat(m.marks_obtained || 0) >= (testInfo?.max_marks * 0.4)).length;
  const passPercentage = marksData.length > 0 ? ((passCount / marksData.length) * 100).toFixed(1) : 0;
  
  // Statistics - Compact
  doc.text(`Avg: ${avgMarks}`, 14, 38);
  doc.text(`High: ${highestMarks}`, 45, 38);
  doc.text(`Low: ${lowestMarks}`, 75, 38);
  doc.text(`Pass: ${passCount} (${passPercentage}%)`, 105, 38);
  
  // Split students into two columns
  const midpoint = Math.ceil(marksData.length / 2);
  const leftColumnData = marksData.slice(0, midpoint);
  const rightColumnData = marksData.slice(midpoint);
  
  // Left Column Table
  const leftTableData = leftColumnData.map((mark, index) => [
    index + 1,
    mark.student_roll_no || 'N/A',
    mark.student_name || 'N/A',
    mark.marks_obtained || '0',
    mark.converted_marks || '0'
  ]);
  
  autoTable(doc, {
    startY: 42,
    head: [['#', 'Roll No', 'Name', `Out of ${testInfo?.max_marks || 50}`, `Out of ${testInfo?.converted_max_marks || 15}`]],
    body: leftTableData,
    theme: 'striped',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 6
    },
    styles: {
      fontSize: 6,
      cellPadding: 1.5
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 6 },
      1: { halign: 'center', cellWidth: 15 },
      2: { cellWidth: 32 },
      3: { halign: 'center', cellWidth: 15 },
      4: { halign: 'center', cellWidth: 15 }
    },
    margin: { left: 14, right: 111 },
    tableWidth: 83
  });
  
  // Right Column Table
  const rightTableData = rightColumnData.map((mark, index) => [
    midpoint + index + 1,
    mark.student_roll_no || 'N/A',
    mark.student_name || 'N/A',
    mark.marks_obtained || '0',
    mark.converted_marks || '0'
  ]);
  
  autoTable(doc, {
    startY: 42,
    head: [['#', 'Roll No', 'Name', `Out of ${testInfo?.max_marks || 50}`, `Out of ${testInfo?.converted_max_marks || 15}`]],
    body: rightTableData,
    theme: 'striped',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 6
    },
    styles: {
      fontSize: 6,
      cellPadding: 1.5
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 6 },
      1: { halign: 'center', cellWidth: 15 },
      2: { cellWidth: 32 },
      3: { halign: 'center', cellWidth: 15 },
      4: { halign: 'center', cellWidth: 15 }
    },
    margin: { left: 111, right: 14 },
    tableWidth: 83
  });
  
  // Get Y position after tables
  const finalY = doc.lastAutoTable.finalY + 5;
  
  // Draw Performance Chart - Compact
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.text('Performance Chart', 14, finalY);
  
  const chartX = 25;
  const chartY = finalY + 8;
  const chartWidth = 75;
  const chartHeight = 35;
  
  // Draw axes
  doc.setDrawColor(100);
  doc.setLineWidth(0.5);
  doc.line(chartX, chartY + chartHeight, chartX + chartWidth, chartY + chartHeight); // X-axis
  doc.line(chartX, chartY, chartX, chartY + chartHeight); // Y-axis
  
  // Y-axis labels and grid (0, 10, 20, 30, 40, 50)
  const maxMarksValue = parseFloat(testInfo?.max_marks || 50);
  const yInterval = 10;
  const numYLabels = Math.floor(maxMarksValue / yInterval) + 1;
  
  doc.setFontSize(6);
  doc.setTextColor(0);
  doc.setDrawColor(220);
  doc.setLineWidth(0.2);
  
  for (let i = 0; i <= numYLabels; i++) {
    const markValue = i * yInterval;
    if (markValue > maxMarksValue) break;
    
    const yPos = chartY + chartHeight - ((markValue / maxMarksValue) * chartHeight);
    
    // Y-axis label
    doc.text(markValue.toString(), chartX - 4, yPos + 1, { align: 'right' });
    
    // Grid line
    doc.setLineDash([1, 1]);
    doc.line(chartX, yPos, chartX + chartWidth, yPos);
    doc.setLineDash([]);
  }
  
  // Y-axis title
  doc.setFontSize(7);
  doc.setFont(undefined, 'bold');
  doc.text('Marks', chartX - 10, chartY + chartHeight / 2, { angle: 90 });
  
  // X-axis title
  doc.text('Students', chartX + chartWidth / 2, chartY + chartHeight + 8, { align: 'center' });
  
  // Draw chart data
  if (marksData.length > 0) {
    const pointSpacing = chartWidth / (marksData.length - 1 || 1);
    
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(1);
    
    // Draw line connecting points
    for (let i = 0; i < marksData.length - 1; i++) {
      const x1 = chartX + (i * pointSpacing);
      const y1 = chartY + chartHeight - ((parseFloat(marksData[i].marks_obtained || 0) / maxMarksValue) * chartHeight);
      const x2 = chartX + ((i + 1) * pointSpacing);
      const y2 = chartY + chartHeight - ((parseFloat(marksData[i + 1].marks_obtained || 0) / maxMarksValue) * chartHeight);
      
      doc.line(x1, y1, x2, y2);
    }
    
    // Draw points
    doc.setFillColor(231, 76, 60);
    marksData.forEach((mark, index) => {
      const x = chartX + (index * pointSpacing);
      const y = chartY + chartHeight - ((parseFloat(mark.marks_obtained || 0) / maxMarksValue) * chartHeight);
      doc.circle(x, y, 1, 'F');
    });
    
    // Draw average line
    const avgY = chartY + chartHeight - ((avgMarks / maxMarksValue) * chartHeight);
    doc.setDrawColor(46, 204, 113);
    doc.setLineWidth(0.5);
    doc.setLineDash([2, 2]);
    doc.line(chartX, avgY, chartX + chartWidth, avgY);
    doc.setLineDash([]);
    
    // Average label
    doc.setFontSize(6);
    doc.setTextColor(46, 204, 113);
    doc.text(`Avg: ${avgMarks}`, chartX + chartWidth + 2, avgY + 1);
  }
  
  doc.setTextColor(0);
  doc.setFont(undefined, 'normal');
  
  // Summary Box - Below chart on LEFT side
  const summaryStartY = chartY + chartHeight + 10;
  const summaryX = 14;
  const summaryWidth = 90;
  
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.text('Summary', summaryX, summaryStartY);
  
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  
  const rowHeight = 6;
  const col1Width = summaryWidth * 0.6;
  const col2Width = summaryWidth * 0.4;
  let currentY = summaryStartY + 3;
  
  // Row 1: Total Students and Absentees
  doc.rect(summaryX, currentY, col1Width, rowHeight);
  doc.rect(summaryX + col1Width, currentY, col2Width, rowHeight);
  doc.setFontSize(7);
  doc.setFont(undefined, 'bold');
  doc.text('Total No. of Students :', summaryX + 2, currentY + 4);
  doc.setFont(undefined, 'normal');
  doc.text(marksData.length.toString(), summaryX + col1Width + col2Width / 2, currentY + 4, { align: 'center' });
  
  doc.rect(summaryX, currentY + rowHeight, col1Width, rowHeight);
  doc.rect(summaryX + col1Width, currentY + rowHeight, col2Width, rowHeight);
  doc.setFont(undefined, 'bold');
  doc.text('No. of Absentees :', summaryX + 2, currentY + rowHeight + 4);
  doc.setFont(undefined, 'normal');
  doc.text('0', summaryX + col1Width + col2Width / 2, currentY + rowHeight + 4, { align: 'center' });
  currentY += rowHeight * 2;
  
  // Row 2: Students Attended
  doc.rect(summaryX, currentY, col1Width, rowHeight);
  doc.rect(summaryX + col1Width, currentY, col2Width, rowHeight);
  doc.setFont(undefined, 'bold');
  doc.text('No. of Students Attended:', summaryX + 2, currentY + 4);
  doc.setFont(undefined, 'normal');
  doc.text(marksData.length.toString(), summaryX + col1Width + col2Width / 2, currentY + 4, { align: 'center' });
  
  doc.rect(summaryX, currentY + rowHeight, col1Width, rowHeight);
  doc.rect(summaryX + col1Width, currentY + rowHeight, col2Width, rowHeight);
  doc.setFont(undefined, 'bold');
  doc.text('No. of Malpractice :', summaryX + 2, currentY + rowHeight + 4);
  doc.setFont(undefined, 'normal');
  doc.text('0', summaryX + col1Width + col2Width / 2, currentY + rowHeight + 4, { align: 'center' });
  currentY += rowHeight * 2;
  
  // Row 3: Students Passed and Failed
  doc.rect(summaryX, currentY, col1Width, rowHeight);
  doc.rect(summaryX + col1Width, currentY, col2Width, rowHeight);
  doc.setFont(undefined, 'bold');
  doc.text('No. of Students Passed :', summaryX + 2, currentY + 4);
  doc.setFont(undefined, 'normal');
  doc.text(passCount.toString(), summaryX + col1Width + col2Width / 2, currentY + 4, { align: 'center' });
  
  doc.rect(summaryX, currentY + rowHeight, col1Width, rowHeight);
  doc.rect(summaryX + col1Width, currentY + rowHeight, col2Width, rowHeight);
  doc.setFont(undefined, 'bold');
  doc.text('No. of Students Failed :', summaryX + 2, currentY + rowHeight + 4);
  doc.setFont(undefined, 'normal');
  doc.text((marksData.length - passCount).toString(), summaryX + col1Width + col2Width / 2, currentY + rowHeight + 4, { align: 'center' });
  currentY += rowHeight * 2;
  
  // Row 4: Class Average and Pass Percentage
  doc.rect(summaryX, currentY, col1Width, rowHeight);
  doc.rect(summaryX + col1Width, currentY, col2Width, rowHeight);
  doc.setFont(undefined, 'bold');
  doc.text(`Class Average (for ${testInfo?.max_marks || 40}):`, summaryX + 2, currentY + 4);
  doc.setFont(undefined, 'normal');
  doc.text(avgMarks.toString(), summaryX + col1Width + col2Width / 2, currentY + 4, { align: 'center' });
  
  doc.rect(summaryX, currentY + rowHeight, col1Width, rowHeight);
  doc.rect(summaryX + col1Width, currentY + rowHeight, col2Width, rowHeight);
  doc.setFont(undefined, 'bold');
  doc.text('Pass Percentage :', summaryX + 2, currentY + rowHeight + 4);
  doc.setFont(undefined, 'normal');
  doc.text(`${passPercentage}%`, summaryX + col1Width + col2Width / 2, currentY + rowHeight + 4, { align: 'center' });
  currentY += rowHeight * 2;
  
  // Row 5: Faculty Signature (full width)
  doc.rect(summaryX, currentY, summaryWidth, rowHeight);
  doc.setFont(undefined, 'bold');
  doc.text('Faculty Signature:', summaryX + 2, currentY + 4);
  
  // Signature Boxes - RIGHT side below chart
  const sigX = summaryX + summaryWidth + 5;
  const sigWidth = 90;
  const sigBoxHeight = 15;
  let sigY = summaryStartY + 3;
  
  doc.setFontSize(8);
  doc.text('Signatures', sigX, summaryStartY);
  
  // HoD Signature
  doc.rect(sigX, sigY, sigWidth, sigBoxHeight);
  doc.setFontSize(7);
  doc.setFont(undefined, 'normal');
  doc.text('HoD Signature', sigX + sigWidth / 2, sigY + sigBoxHeight / 2, { align: 'center' });
  sigY += sigBoxHeight;
  
  // VP Exams Signature
  doc.rect(sigX, sigY, sigWidth, sigBoxHeight);
  doc.text('VP Exams Signature', sigX + sigWidth / 2, sigY + sigBoxHeight / 2, { align: 'center' });
  sigY += sigBoxHeight;
  
  // DEAN, FET Signature
  doc.rect(sigX, sigY, sigWidth, sigBoxHeight);
  doc.text('DEAN, FET Signature', sigX + sigWidth / 2, sigY + sigBoxHeight / 2, { align: 'center' });
  
  doc.setFont(undefined, 'normal');
  
  // Open PDF in new tab
  window.open(URL.createObjectURL(doc.output('blob')), '_blank');
}

/**
 * Generate individual student report card
 */
export function generateStudentReportCard(studentMarks, studentInfo) {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, 210, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('SRM INSTITUTE', 105, 15, { align: 'center' });
  doc.setFontSize(14);
  doc.text('STUDENT REPORT CARD', 105, 25, { align: 'center' });
  
  // Student Info
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text(`Name: ${studentInfo.student_name}`, 14, 50);
  doc.text(`Roll No: ${studentInfo.student_roll_no}`, 14, 58);
  doc.text(`Class: ${studentInfo.class || 'N/A'}`, 14, 66);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 50);
  
  // Marks Table
  const tableData = studentMarks.map((mark, index) => [
    index + 1,
    mark.test_name || 'N/A',
    mark.subject_name || 'N/A',
    `${mark.marks_obtained} / ${mark.max_marks}`,
    `${mark.converted_marks} / ${mark.converted_max_marks}`,
    ((parseFloat(mark.marks_obtained) / parseFloat(mark.max_marks)) * 100).toFixed(2) + '%'
  ]);
  
  autoTable(doc, {
    startY: 75,
    head: [['#', 'Test', 'Subject', 'Marks', 'Converted', 'Percentage']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    }
  });
  
  // Open PDF in new window instead of downloading
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
}
