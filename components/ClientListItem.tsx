interface ClientListItemProps {
  fullName: string;
  totalDebt: number;
  agreedAmount: number;
}

export default function ClientListItem({ fullName, totalDebt, agreedAmount }: ClientListItemProps) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{fullName}</h3>
      <p className="text-xs text-gray-500 mt-1">
        Adeudo: ${totalDebt.toFixed(2)} / Pactado: ${agreedAmount.toFixed(2)}
      </p>
    </div>
  );
}
