interface Badge {
  name: string;
  description: string;
  category: 'contribution' | 'exploration' | 'quality' | 'achievement' | 'special';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlockedAt?: Date;
}

export default function Badge({ badge }: { badge: Badge }) {
  return (
    <div className={`badge badge-${badge.difficulty}`}>
      <h3 className="badge-name">{badge.name}</h3>
      <p className="badge-description">{badge.description}</p>
      <span className={`badge-category badge-category-${badge.category}`}>
        {badge.category}
      </span>
      {badge.unlockedAt && (
        <span className="badge-unlocked-at">
          Unlocked on: {new Date(badge.unlockedAt).toLocaleDateString()}
        </span>
      )}
    </div>
  );

}