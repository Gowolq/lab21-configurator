interface Room {
  id: number;
  level: string;
  roomName: string;
  surface: string;
  area: number;
  product?: string;
  collapsed?: boolean;
}

interface ServiceState {
  roomId: number;
  serviceType: string;
  serviceTitle: string;
  area: number;
  isActive: boolean;
  isMandatory: boolean;
}

export function validateServiceArea(
  roomId: number,
  serviceType: string,
  serviceTitle: string,
  newArea: number,
  rooms: Room[],
  services: ServiceState[],
  language: string = 'nl'
): { isValid: boolean; maxAllowed: number; currentTotal: number; message?: string } {
  // Find the room
  const room = rooms.find(r => r.id === roomId);
  if (!room) {
    return { 
      isValid: false, 
      maxAllowed: 0, 
      currentTotal: 0, 
      message: language === 'en' ? "Room not found" : "Ruimte niet gevonden" 
    };
  }

  // Calculate current total area used by all services for this room (excluding the current service being edited)
  const currentServicesTotal = services
    .filter(s => 
      s.roomId === roomId && 
      s.isActive && 
      !(s.serviceType === serviceType && s.serviceTitle === serviceTitle)
    )
    .reduce((total, service) => total + service.area, 0);

  const newTotal = currentServicesTotal + newArea;
  const maxAllowed = room.area;
  
  // TEMPORARILY DISABLED - Service area validation
  return {
    isValid: true, // Always valid - no area restrictions
    maxAllowed,
    currentTotal: currentServicesTotal,
    message: undefined // No validation messages
  };
}

export function getRoomServicesSummary(roomId: number, services: ServiceState[]): { totalUsed: number; serviceBreakdown: { serviceType: string; serviceTitle: string; area: number }[] } {
  const roomServices = services.filter(s => s.roomId === roomId && s.isActive);
  const totalUsed = roomServices.reduce((total, service) => total + service.area, 0);
  const serviceBreakdown = roomServices.map(s => ({
    serviceType: s.serviceType,
    serviceTitle: s.serviceTitle,
    area: s.area
  }));

  return { totalUsed, serviceBreakdown };
}