import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Electronics', value: 35, color: 'hsl(173, 58%, 39%)', stockValue: 245000, avgPrice: 299 },
  { name: 'Apparel', value: 25, color: 'hsl(199, 89%, 48%)', stockValue: 180000, avgPrice: 89 },
  { name: 'Home & Kitchen', value: 20, color: 'hsl(262, 83%, 58%)', stockValue: 120000, avgPrice: 149 },
  { name: 'Sports', value: 12, color: 'hsl(38, 92%, 50%)', stockValue: 85000, avgPrice: 199 },
  { name: 'Other', value: 8, color: 'hsl(220, 9%, 46%)', stockValue: 45000, avgPrice: 79 },
];

export function CategoryDistribution() {
  return (
    <div className="bento-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Category Distribution</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Share of recommendations by product category
        </p>
      </div>
      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ value }) => `${value}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(220, 13%, 91%)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-white border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold text-sm mb-2">{item.name}</p>
                      <div className="space-y-1 text-xs">
                        <p className="text-muted-foreground">Share: <span className="font-medium text-foreground">{item.value}%</span></p>
                        <p className="text-muted-foreground">Stock Value: <span className="font-medium text-foreground">₹{item.stockValue.toLocaleString()}</span></p>
                        <p className="text-muted-foreground">Avg Price: <span className="font-medium text-foreground">₹{item.avgPrice}</span></p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
