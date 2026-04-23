<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Income Statement</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 12px; color: #0F172A; }
        .header { background: #0F172A; color: #fff; padding: 20px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 22px; }
        .header p { margin: 4px 0 0; font-size: 12px; color: #94A3B8; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 14px; font-weight: bold; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px; margin-bottom: 10px; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #F1F5F9; }
        .total-row { font-weight: bold; font-size: 14px; padding: 10px 0; border-top: 2px solid #0F172A; }
        .net-profit { font-size: 18px; font-weight: bold; text-align: center; padding: 16px; margin-top: 20px; border-radius: 8px; }
        .profit { background: #D1FAE5; color: #065F46; }
        .loss { background: #FEE2E2; color: #991B1B; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 6px 8px; border-bottom: 1px solid #F1F5F9; }
        .amount { text-align: right; }
        .bold { font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $user->business_name ?? 'SkillLeo' }}</h1>
        <p>Income Statement | {{ \Carbon\Carbon::parse($from_date)->format('d M Y') }} — {{ \Carbon\Carbon::parse($to_date)->format('d M Y') }}</p>
    </div>

    <div class="section">
        <div class="section-title">INCOME</div>
        <table>
            @foreach($income_categories as $cat)
            <tr>
                <td>{{ $cat['name'] }}</td>
                <td class="amount">{{ $cat['formatted'] }}</td>
            </tr>
            @endforeach
            <tr class="bold">
                <td>Total Income</td>
                <td class="amount">{{ $income_formatted }}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">EXPENSES</div>
        <table>
            @foreach($expense_categories as $cat)
            <tr>
                <td>{{ $cat['name'] }}</td>
                <td class="amount">{{ $cat['formatted'] }}</td>
            </tr>
            @endforeach
            <tr class="bold">
                <td>Total Expenses</td>
                <td class="amount">{{ $expense_formatted }}</td>
            </tr>
        </table>
    </div>

    <div class="net-profit {{ $is_profit ? 'profit' : 'loss' }}">
        {{ $is_profit ? 'Net Profit' : 'Net Loss' }}: {{ $net_formatted }}
    </div>
</body>
</html>
