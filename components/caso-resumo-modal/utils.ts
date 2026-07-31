export function mapStatusAvancar(statusId: number): number | null {
  switch (statusId) {
    case 1:
    case 2:
    case 4:
      return 3;
    case 3:
      return 9;
    default:
      return null;
  }
}
