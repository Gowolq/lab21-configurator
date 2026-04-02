# Instructies voor het updaten van de 6 installatie services

In `/utils/legserviceArticles.ts` moeten de volgende 6 services worden geüpdatet met de nieuwe eigenschappen:

## Verplichte Services (3 stuks)

### 1. LS-INSTALL-001 (rond regel 109-118)
Voeg toe na `category: "Installatie",`:
```typescript
subcategorie: "Voorbereiding",
laminaat: true,
klikPvc: true,
merk: "Lab21",
vve: false,
```

### 2. LS-INSTALL-002 (rond regel 119-128)
Voeg toe na `category: "Installatie",`:
```typescript
subcategorie: "Montage",
laminaat: true,
klikPvc: true,
merk: "Lab21",
vve: false,
```

### 3. LS-INSTALL-003 (rond regel 129-138)
Voeg toe na `category: "Installatie",`:
```typescript
subcategorie: "Afwerking",
laminaat: false,
klikPvc: false,
merk: "Lab21",
vve: true,
```

## Optionele Services (3 stuks)

### 4. LS-OPT-001 (rond regel 315-324)
Voeg toe na `category: "Installatie",`:
```typescript
subcategorie: "Ondervloer",
laminaat: true,
klikPvc: false,
merk: "Quick-Step",
vve: false,
```

### 5. LS-OPT-002 (rond regel 325-334)
Voeg toe na `category: "Installatie",`:
```typescript
subcategorie: "Vochtbescherming",
laminaat: true,
klikPvc: true,
merk: "Lab21",
vve: false,
```

### 6. LS-OPT-003 (rond regel 335-344)
Voeg toe na `category: "Installatie",`:
```typescript
subcategorie: "Isolatie",
laminaat: false,
klikPvc: false,
merk: "Rockwool",
vve: false,
```

---

## Voorbeeld van hoe een service eruit moet zien NA de update:

```typescript
{
  productCode: "LS-INSTALL-001",
  description: "Voorbereiden Ondergrond - Basiswerkzaamheden voor het voorbereiden van de ondergrond voor leggen",
  serviceType: "Legservice",
  isMandatory: true,
  category: "Installatie",
  subcategorie: "Voorbereiding",
  laminaat: true,
  klikPvc: true,
  merk: "Lab21",
  vve: false,
  // GEEN filters - altijd zichtbaar!
  van: 35,
  tot: 9999
},
```

## Verwacht resultaat

Na deze update zal de eigenschappen regel er als volgt uitzien:

**Voorbeeld voor LS-INSTALL-001:**
```
Legmethode: Gelijmd / Legpatroon: Hongaarse punt; Patroon; Weense punt / Type vloerverwarming: Geen / Ondergrond: Zandcement / Subcategorie: Voorbereiding / Laminaat: Ja / Klik PVC: Ja / Merk: Lab21 / VVE: Nee
```
