<#
  Builds the Office deliverables of catalogue batch 3 through Microsoft Office
  itself (COM automation), so every DOCX, XLSX and PPTX is written by Word,
  Excel or PowerPoint and opens without repair prompts.

    powershell -ExecutionPolicy Bypass -File scripts/catalog/batch3/office/office_build.ps1 -Manifest <jobs.json>

  The manifest is a JSON array of jobs (all paths absolute):
    { "type": "docx", "in": "…\doc.html", "out": "…\doc.docx", "pdf": "…\doc.pdf",
      "page": { "width": 595, "height": 842, "margin": 54 } }            # points
    { "type": "xlsx", "spec": "…\book.json", "out": "…\book.xlsx", "pdf": "…\book.pdf" }
    { "type": "pptx", "spec": "…\deck.json", "out": "…\deck.pptx", "pdf": "…\deck.pdf", "png": "…\slides" }

  Colours in specs are "#rrggbb"; Office wants BGR integers. Windows
  PowerShell parses JSON numbers as Decimal, which COM rejects, so every
  number is passed through D() (double) before it reaches Office.
#>
param([Parameter(Mandatory = $true)] [string] $Manifest)
$ErrorActionPreference = "Stop"

function Bgr([string] $hex) {
  $h = $hex.TrimStart("#")
  $r = [Convert]::ToInt32($h.Substring(0, 2), 16)
  $g = [Convert]::ToInt32($h.Substring(2, 2), 16)
  $b = [Convert]::ToInt32($h.Substring(4, 2), 16)
  return [int] ($r + 256 * $g + 65536 * $b)
}
function D($v) { return [double] $v }
function Has($obj, [string] $name) { return $null -ne $obj.PSObject.Properties[$name] }

$jobs = Get-Content -LiteralPath $Manifest -Raw -Encoding UTF8 | ConvertFrom-Json
$word = $null; $excel = $null; $ppt = $null
try {
  foreach ($j in $jobs) {
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $j.out) | Out-Null

    if ($j.type -eq "docx") {
      if (-not $word) { $word = New-Object -ComObject Word.Application; $word.Visible = $false; $word.DisplayAlerts = 0 }
      $doc = $word.Documents.Open($j.in, $false, $true)
      $doc.ActiveWindow.View.Type = 3   # print layout, not web layout
      if (Has $j "page") {
        $doc.PageSetup.PageWidth = D $j.page.width
        $doc.PageSetup.PageHeight = D $j.page.height
        foreach ($side in "TopMargin", "BottomMargin", "LeftMargin", "RightMargin") { $doc.PageSetup.$side = D $j.page.margin }
      }
      $doc.SaveAs2($j.out, 16)          # wdFormatXMLDocument
      if (Has $j "pdf") { $doc.SaveAs2($j.pdf, 17) }
      $doc.Close(0)
    }

    elseif ($j.type -eq "xlsx") {
      if (-not $excel) { $excel = New-Object -ComObject Excel.Application; $excel.Visible = $false; $excel.DisplayAlerts = $false }
      $spec = Get-Content -LiteralPath $j.spec -Raw -Encoding UTF8 | ConvertFrom-Json
      $wb = $excel.Workbooks.Add()
      while ($wb.Worksheets.Count -lt $spec.sheets.Count) { [void] $wb.Worksheets.Add([Type]::Missing, $wb.Worksheets.Item($wb.Worksheets.Count)) }
      for ($si = 0; $si -lt $spec.sheets.Count; $si++) {
        $s = $spec.sheets[$si]
        $ws = $wb.Worksheets.Item($si + 1)
        $ws.Name = [string] $s.name
        $ws.Cells.Font.Name = [string] $spec.font
        if (Has $s "tab") { $ws.Tab.Color = Bgr $s.tab }
        if (Has $s "widths") { for ($c = 0; $c -lt $s.widths.Count; $c++) { $ws.Columns.Item($c + 1).ColumnWidth = D $s.widths[$c] } }
        foreach ($cell in $s.cells) {
          $rg = $ws.Range([string] $cell.a)
          if (Has $cell "f") { $rg.Formula = [string] $cell.f }
          elseif (Has $cell "v") {
            if ($cell.v -is [string]) { $rg.Value2 = [string] $cell.v } else { $rg.Value2 = D $cell.v }
          }
          if (Has $cell "s") {
            $st = $spec.styles.($cell.s)
            if (Has $st "bold") { $rg.Font.Bold = [bool] $st.bold }
            if (Has $st "italic") { $rg.Font.Italic = [bool] $st.italic }
            if (Has $st "size") { $rg.Font.Size = D $st.size }
            if (Has $st "color") { $rg.Font.Color = Bgr $st.color }
            if (Has $st "fill") { $rg.Interior.Color = Bgr $st.fill }
            if (Has $st "num") { $rg.NumberFormat = [string] $st.num }
            if (Has $st "align") { $rg.HorizontalAlignment = @{ left = -4131; center = -4108; right = -4152 }[[string] $st.align] }
            if (Has $st "wrap") { $rg.WrapText = [bool] $st.wrap }
            if (Has $st "border") { $rg.Borders.Item(9).LineStyle = 1; $rg.Borders.Item(9).Color = Bgr $st.border }
          }
        }
        if (Has $s "merges") { foreach ($m in $s.merges) { [void] $ws.Range([string] $m).Merge() } }
        if (Has $s "heights") { foreach ($h in $s.heights) { $ws.Rows.Item([int] $h.row).RowHeight = D $h.pt } }
        if (Has $s "landscape") { $ws.PageSetup.Orientation = 2; $ws.PageSetup.Zoom = $false; $ws.PageSetup.FitToPagesWide = 1; $ws.PageSetup.FitToPagesTall = $false }
        $ws.Activate()
        if (Has $s "freeze") {
          $excel.ActiveWindow.FreezePanes = $false
          [void] $ws.Range([string] $s.freeze).Select()
          $excel.ActiveWindow.FreezePanes = $true
        }
        [void] $ws.Range("A1").Select()
      }
      # Optional previews: a range of a real sheet (with computed formulas)
      # copied as a vector picture into a temporary chart and exported as PNG.
      if (Has $j "shots") {
        foreach ($shot in $j.shots) {
          $ws = $wb.Worksheets.Item([string] $shot.sheet)
          $ws.Activate()
          $rg = $ws.Range([string] $shot.range)
          $scale = $(if (Has $shot "scale") { D $shot.scale } else { 2.0 })
          try { [void] $rg.CopyPicture(1, -4147) } catch { [void] $rg.CopyPicture(2, -4147) }
          $co = $ws.ChartObjects().Add(0.0, 0.0, (D $rg.Width) * $scale, (D $rg.Height) * $scale)
          $co.Chart.ChartArea.Format.Line.Visible = 0
          $co.Activate()
          [void] $co.Chart.Paste()
          $pic = $co.Chart.Shapes.Item($co.Chart.Shapes.Count)
          $pic.LockAspectRatio = 0
          $pic.Left = 0.0; $pic.Top = 0.0
          $pic.Width = (D $rg.Width) * $scale; $pic.Height = (D $rg.Height) * $scale
          [void] $co.Chart.Export([string] $shot.out, "PNG")
          $co.Delete()
        }
      }
      $wb.Worksheets.Item(1).Activate()
      $wb.SaveAs($j.out, 51)            # xlOpenXMLWorkbook
      if (Has $j "pdf") { $wb.ExportAsFixedFormat(0, $j.pdf) }
      $wb.Close($false)
    }

    elseif ($j.type -eq "pptx") {
      if (-not $ppt) { $ppt = New-Object -ComObject PowerPoint.Application }
      $spec = Get-Content -LiteralPath $j.spec -Raw -Encoding UTF8 | ConvertFrom-Json
      $pres = $ppt.Presentations.Add(0)  # no window
      $pres.PageSetup.SlideWidth = D $spec.width
      $pres.PageSetup.SlideHeight = D $spec.height
      $i = 0
      foreach ($sd in $spec.slides) {
        $i++
        $slide = $pres.Slides.Add($i, 12)  # ppLayoutBlank
        $slide.FollowMasterBackground = 0
        $slide.Background.Fill.Solid()
        $slide.Background.Fill.ForeColor.RGB = Bgr $sd.bg
        foreach ($sh in $sd.shapes) {
          if ($sh.type -eq "line") {
            $shape = $slide.Shapes.AddLine((D $sh.x), (D $sh.y), (D $sh.x2), (D $sh.y2))
            $shape.Line.ForeColor.RGB = Bgr $sh.line
            $shape.Line.Weight = D $sh.weight
            continue
          }
          if ($sh.type -eq "text") {
            $shape = $slide.Shapes.AddTextbox(1, (D $sh.x), (D $sh.y), (D $sh.w), (D $sh.h))
          } else {
            $kind = @{ rect = 1; round = 5; oval = 9 }[[string] $sh.type]
            $shape = $slide.Shapes.AddShape($kind, (D $sh.x), (D $sh.y), (D $sh.w), (D $sh.h))
            if ($sh.type -eq "round" -and (Has $sh "radius")) { $shape.Adjustments.Item(1) = D $sh.radius }
            $shape.Shadow.Visible = 0
          }
          if (Has $sh "fill") { $shape.Fill.Visible = -1; $shape.Fill.Solid(); $shape.Fill.ForeColor.RGB = Bgr $sh.fill } else { $shape.Fill.Visible = 0 }
          if (Has $sh "stroke") { $shape.Line.Visible = -1; $shape.Line.ForeColor.RGB = Bgr $sh.stroke; $shape.Line.Weight = 1 } else { $shape.Line.Visible = 0 }
          if (Has $sh "text") {
            $tf = $shape.TextFrame
            $tf.WordWrap = -1
            $tf.AutoSize = 0
            $pad = $(if (Has $sh "pad") { D $sh.pad } else { 0.0 })
            $tf.MarginLeft = $pad; $tf.MarginRight = $pad; $tf.MarginTop = $pad; $tf.MarginBottom = $pad
            $tf.VerticalAnchor = @{ top = 1; middle = 3; bottom = 4 }[$(if (Has $sh "valign") { [string] $sh.valign } else { "top" })]
            $tr = $tf.TextRange
            $tr.Text = [string] $sh.text
            $tr.Font.Name = $(if (Has $sh "font") { [string] $sh.font } else { [string] $spec.font })
            $tr.Font.Size = D $sh.size
            $tr.Font.Bold = $(if ((Has $sh "bold") -and $sh.bold) { -1 } else { 0 })
            $tr.Font.Color.RGB = Bgr $sh.color
            $tr.ParagraphFormat.Alignment = @{ left = 1; center = 2; right = 3 }[$(if (Has $sh "align") { [string] $sh.align } else { "left" })]
            if (Has $sh "spacing") { $tr.ParagraphFormat.SpaceWithin = D $sh.spacing }
          }
        }
      }
      $pres.SaveAs($j.out, 24)          # ppSaveAsOpenXMLPresentation
      if (Has $j "pdf") { $pres.SaveAs($j.pdf, 32) }
      if (Has $j "png") {
        New-Item -ItemType Directory -Force -Path $j.png | Out-Null
        $n = 0
        foreach ($s in $pres.Slides) { $n++; $s.Export((Join-Path $j.png ("slide-{0:D2}.png" -f $n)), "PNG", 1600, 900) }
      }
      $pres.Close()
    }
    Write-Output "ok $($j.type) $(Split-Path -Leaf $j.out)"
  }
} finally {
  if ($word) { $word.Quit(); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
  if ($excel) { $excel.Quit(); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($excel) }
  if ($ppt) { $ppt.Quit(); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) }
}
