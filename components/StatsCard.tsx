interface Props {
  title: string;
  value: number;
}

export default function StatsCard({ title, value }: Props) {
  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-3xl font-semibold mt-2 text-gray-900">
        {value}
      </div>
    </div>
  );
}
