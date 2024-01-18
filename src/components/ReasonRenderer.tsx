export function ReasonRenderer({ reason }: { reason: string | string[] }) {
  return Array.isArray(reason) ? (
    <ul className="list-disc pl-4">
      {reason.map((reason, i) => (
        <li key={i}>
          {reason
            .split(":")
            .map((e, i, arr) =>
              i === 0 && arr.length === 2 ? (
                <b key={i}>{e}:</b>
              ) : (
                <span key={e}>{e}</span>
              ),
            )}
        </li>
      ))}
    </ul>
  ) : (
    reason || ""
  );
}
