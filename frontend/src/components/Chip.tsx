export default function Chip({ label, ...props }: { label: string } & React.HTMLAttributes<HTMLSpanElement>) {
	return (
		<div>
			<span className={`px-2 py-1 text-sm font-bold rounded-full ${props.className}`}>
				{label}
			</span>
		</div>
	);
}
