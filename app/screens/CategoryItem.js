const CategoryItem = ({ item }) => {
  const isSelected = selectedCategory === item.name;
  const isSmallScreen = width < 375;
  const isMediumScreen = width >= 375 && width < 768;
  const isLargeScreen = width >= 768;

  // Responsive sizing
  const itemWidth = isSmallScreen ? width * 0.28 : isMediumScreen ? width * 0.23 : width * 0.18;
  const textSize = isSmallScreen ? 'text-xs' : 'text-sm';
  const borderSize = isSmallScreen ? 'border' : 'border-2';

  return (
    <View className={`items-center mb-4`} style={{ width: itemWidth }}>
      <TouchableOpacity
        activeOpacity={0.9}
        className="w-full"
        onPress={() => setSelectedCategory(item.name)}
      >
        <View className={`
          bg-white rounded-xl p-2 mb-2 
          ${borderSize} 
          ${isSelected ? 'border-green-500' : 'border-gray-100'}
          shadow-sm
        `}>
          <View className="w-full aspect-square rounded-lg overflow-hidden">
            <Image
              source={{ uri: item.image }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        </View>
        <Text className={`
          ${textSize} font-semibold text-center
          ${isSelected ? 'text-green-500' : 'text-gray-800'}
        `}>
          {item.name}
        </Text>
      </TouchableOpacity>
    </View>
  );
};